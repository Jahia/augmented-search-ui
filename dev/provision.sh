#!/usr/bin/env bash
# Provision the local stack into a working Augmented Search environment. Runs on bare metal.
#
# Wait for Jahia -> platform manifest -> deploy the module -> enable it on digitall -> place and
# publish the component -> wait for indexing to settle.
#
# Idempotent: the platform step is skipped once the Digitall site exists (--force overrides).
#
# Usage: dev/provision.sh [--force]
set -euo pipefail

# Paths below are relative to the repo root.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

FORCE_PLATFORM=false
while (( $# > 0 )); do
    case "$1" in
        --force) FORCE_PLATFORM=true ;;
        *) echo "usage: dev/provision.sh [--force]" >&2; exit 2 ;;
    esac
    shift
done

# --- configuration ----------------------------------------------------------------------------
# Read .env the way dotenv does — an already-exported value wins.
if [[ -f .env ]]; then
    while IFS='=' read -r key value; do
        [[ "${key}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
        [[ -n "${!key-}" ]] && continue
        export "${key}=${value}"
    done < .env
fi

JAHIA_URL="${JAHIA_URL:-http://localhost:${JAHIA_PORT:-8080}}"
ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://localhost:${ELASTICSEARCH_PORT:-9200}}"
# user:password — the pair jahia-deploy expects.
JAHIA_USER="${JAHIA_USER:-root:${JAHIA_PASSWORD:-root1234}}"
MANIFEST="${MANIFEST:-dev/provisioning/manifest.yml}"
INDEX_SCRIPT="${INDEX_SCRIPT:-dev/provisioning/index-digitall.graphql}"
SITE_KEY="${SITE_KEY:-digitall}"
COMPONENT_PATH="/sites/${SITE_KEY}/home/landing/augmented-search"
# Installed when no local package is found, so the environment works without building anything.
RELEASED_MODULE="${RELEASED_MODULE:-mvn:org.jahia.modules/augmented-search-ui/4.0.0}"

# Origin is required: without it Jahia treats the call as unauthenticated whatever credentials it
# carries, and every jcr query fails with "Permission denied".
AUTH=(-u "${JAHIA_USER}" -H "Origin: ${JAHIA_URL}")

log() {
    echo "$(date +'%H:%M:%S') [provision] $*"
    return 0
}

die() {
    echo "$(date +'%H:%M:%S') [provision] FATAL: $*" >&2
    # NOSONAR (S7682: no explicit return) - this function deliberately terminates the script, so a
    # trailing `return` would be unreachable dead code.
    exit 1
}

graphql() {
    local query="$1"
    curl -sS --max-time 120 "${AUTH[@]}" -H 'Content-Type: application/json' \
        -X POST "${JAHIA_URL}/modules/graphql" --data "$(jq -nc --arg q "${query}" '{query: $q}')"
    return $?
}

# The API returns 200 with an error payload for some failures, so the body is the only verdict.
check_response() {
    local what="$1" body="$2"
    grep -qiE '"?error|exception|failure' <<<"${body}" && die "${what} reported a problem"
    return 0
}

wait_for() { # wait_for <description> <seconds> <command...>
    local what="$1"
    local timeout="$2"
    shift 2
    local deadline=$(( SECONDS + timeout ))
    log "waiting for ${what} (timeout ${timeout}s)…"
    until "$@" >/dev/null 2>&1; do
        (( SECONDS < deadline )) || die "timed out waiting for ${what}"
        sleep 5
    done
    log "${what} ✓"
    return 0
}

# --- 0. Host prerequisites ---------------------------------------------------------------------
# Both come from mise.toml, so this only fires outside `mise`.
for binary in curl jq; do
    command -v "${binary}" >/dev/null 2>&1 || die "${binary} is required (mise install)"
done
[[ -f "${MANIFEST}" ]] || die "manifest not found: ${MANIFEST} (run this from the repo, not a copy)"

# --- 1. Jahia up -------------------------------------------------------------------------------
log "target: ${JAHIA_URL} (elasticsearch: ${ELASTICSEARCH_URL})"
curl -sf -o /dev/null --max-time 5 "${JAHIA_URL}/cms/login" 2>/dev/null \
    || log "Jahia is not answering yet — if you have not started the stack, that is 'mise start'"
wait_for "Jahia to serve /cms/login" 900 curl -sf --max-time 10 "${JAHIA_URL}/cms/login"

# --- 2. Platform (Digitall, Augmented Search, the JS-modules engine, ES configuration) ---------
# Skipped when the site exists: the manifest imports Digitall, which is slow and not safe to redo.
site_exists() {
    graphql "query { jcr(workspace: EDIT) { nodeByPath(path: \"/sites/${SITE_KEY}\") { uuid } } }" \
        | grep -q '"uuid"'
    return $?
}

if [[ "${FORCE_PLATFORM}" == false ]] && site_exists; then
    log "platform already provisioned (site ${SITE_KEY} exists) — skipping the manifest (--force to re-apply)"
else
    # Manifest and referenced files travel in ONE multipart request, resolved by bare filename —
    # hence the explicit `filename=`, which holds whatever path this script was given.
    log "applying manifest ${MANIFEST} (this imports and indexes Digitall — expect ~5 minutes)…"
    response=$(curl -sS --max-time 1800 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
        -F "script=@${MANIFEST};type=text/yaml" \
        -F "file=@${INDEX_SCRIPT};filename=$(basename "${INDEX_SCRIPT}")")
    log "provisioning response: ${response}"
    check_response "provisioning" "${response}"
fi

# --- 3. The module under test ------------------------------------------------------------------
# A JavaScript module ships as a .tgz. Prefer dist/package.tgz (just built), then target/ (CI's
# artifact), then the released version.
package="${MODULE_PACKAGE:-}"
if [[ -z "${package}" ]]; then
    if [[ -f dist/package.tgz ]]; then
        package=dist/package.tgz
    else
        # `ls -t` not `find -printf`: this runs on macOS, where find has no -printf.
        # shellcheck disable=SC2012
        package=$(ls -t target/*.tgz 2>/dev/null | head -1 || true)
    fi
fi

if [[ -n "${package}" && -f "${package}" ]]; then
    log "deploying $(basename "${package}")…"
    deploy=$(curl -sS --max-time 600 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
        -F "script=[{\"installOrUpgradeBundle\": [\"$(basename "${package}")\"], \"autoStart\": true}];type=application/json" \
        -F "file=@${package}")
    log "deploy response: ${deploy}"
    check_response "module deployment" "${deploy}"
else
    log "no local package found — installing the released ${RELEASED_MODULE} instead"
    log "(run 'yarn build' first to provision your own build)"
    released=$(curl -sS --max-time 600 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
        -H 'Content-Type: application/json' \
        --data "[{\"installBundle\":[\"${RELEASED_MODULE}\"],\"autoStart\":true,\"uninstallPreviousVersion\":true}]")
    log "deploy response: ${released}"
    check_response "module deployment" "${released}"
fi

# --- 4. Enable the module on the site ----------------------------------------------------------
log "enabling augmented-search-ui on ${SITE_KEY}…"
# Note: this operation returns an EMPTY body on success — silence is success, not failure.
curl -sS --max-time 120 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
    -H 'Content-Type: application/json' \
    --data "[{\"enable\":\"augmented-search-ui\",\"site\":\"${SITE_KEY}\"}]"

# --- 5. Place and publish the search component -------------------------------------------------
# Gated on LIVE, not EDIT: publishing cascades to unpublished ancestors, so publishing on every run
# can add a document to the index — and the suite asserts exact result totals.
if graphql "query { jcr(workspace: LIVE) { nodeByPath(path: \"${COMPONENT_PATH}\") { uuid } } }" \
        | grep -q '"uuid"'; then
    log "component already live at ${COMPONENT_PATH}"
else
    if graphql "query { jcr(workspace: EDIT) { nodeByPath(path: \"${COMPONENT_PATH}\") { uuid } } }" \
            | grep -q '"uuid"'; then
        log "component present in EDIT at ${COMPONENT_PATH}, not yet live"
    else
        log "adding sui:augmentedSearch at ${COMPONENT_PATH}…"
        graphql "mutation { jcr { addNode(parentPathOrId: \"/sites/${SITE_KEY}/home/landing\", name: \"augmented-search\", primaryNodeType: \"sui:augmentedSearch\") { uuid } } }" \
            | tee /dev/stderr | grep -q '"uuid"' || die "could not create the search component"
    fi
    log "publishing…"
    graphql "mutation { jcr(workspace: EDIT) { mutateNode(pathOrId: \"${COMPONENT_PATH}\") { publish(languages: [\"en\",\"fr\",\"de\"]) } } }" \
        | tee /dev/stderr | grep -q '"publish":true' || die "could not publish the search component"
fi

# --- 6. Indexation actually finished -----------------------------------------------------------
# Indexation is async and reports success even when the job later fails, so only the end state counts.
indexed() {
    local docs
    docs=$(curl -sf "${ELASTICSEARCH_URL}/_cat/indices/jahia_as*?h=docs.count" 2>/dev/null \
           | tr -d ' ' | grep -vE '^0?$' | head -1)
    [[ -n "${docs}" ]] && return 0
    return 1
}
wait_for "Augmented Search indices to hold documents" 900 indexed

# Non-empty is not finished: the tests assert exact totals, so wait for the count to stop changing.
total_hits() {
    graphql 'query { search(q: "", workspace: LIVE) { results(size: 1) { totalHits } } }' 2>/dev/null \
        | jq -r '.data.search.results.totalHits // empty'
    return $?
}
log "waiting for indexation to settle…"
settle_deadline=$(( SECONDS + 900 ))
previous=""
stable=0
while (( stable < 2 )); do
    current=$(total_hits)
    if [[ -n "${current}" && "${current}" != "0" && "${current}" == "${previous}" ]]; then
        stable=$(( stable + 1 ))
    else
        stable=0
    fi
    previous="${current}"
    (( SECONDS < settle_deadline )) || die "indexation did not settle (last count: ${current:-none})"
    sleep 10
done
log "indexation settled at ${previous} documents (LIVE, default language) ✓"
curl -sf "${ELASTICSEARCH_URL}/_cat/indices/jahia_as*?v&h=index,docs.count" || true

log "environment ready — ${JAHIA_URL}/sites/${SITE_KEY}/home.html"
log "run the suite with 'mise test', or start the watch loop with 'mise dev'"
