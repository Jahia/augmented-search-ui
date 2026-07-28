#!/usr/bin/env bash
# Provision the environment, then hand over to the test runner.
#
# Runs INSIDE the tests container so that a provisioning failure shows up in the test job's own log
# rather than buried in Jahia's startup output.
#
# Steps: wait for Jahia -> platform manifest -> deploy the module -> enable it on digitall ->
# place + publish the component -> wait for Augmented Search indices.
set -euo pipefail

JAHIA_URL="${JAHIA_URL:-http://jahia:8080}"
ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://elasticsearch:9200}"
SUPER_USER_PASSWORD="${SUPER_USER_PASSWORD:-root1234}"
MANIFEST="${MANIFEST:-provisioning-manifest-stable.yml}"
SITE_KEY="${SITE_KEY:-digitall}"
COMPONENT_PATH="/sites/${SITE_KEY}/home/landing/augmented-search"

# Every Jahia GraphQL call needs an Origin header matching the target. Without it the request is
# treated as unauthenticated and any jcr query fails with "Permission denied" — an error that looks
# like a permissions problem but is a missing header. Basic auth itself is fine.
AUTH=(-u "root:${SUPER_USER_PASSWORD}" -H "Origin: ${JAHIA_URL}")

log() {
    echo "$(date +'%H:%M:%S') [provision] $*"
    return 0
}

die() {
    echo "$(date +'%H:%M:%S') [provision] FATAL: $*" >&2
    exit 1
}

graphql() {
    local query="$1"
    curl -sS --max-time 120 "${AUTH[@]}" -H 'Content-Type: application/json' \
        -X POST "${JAHIA_URL}/modules/graphql" --data "$(jq -nc --arg q "${query}" '{query: $q}')"
    return $?
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

# --- 1. Jahia up ------------------------------------------------------------------------------
wait_for "Jahia to serve /cms/login" 900 curl -sf "${JAHIA_URL}/cms/login"

# --- 2. Platform (Digitall, Augmented Search, the JS-modules engine, ES configuration) --------
# The manifest and the files it references travel in ONE multipart request; the manifest refers to
# them by bare filename, which the provisioning API resolves against the uploaded parts.
log "applying manifest ${MANIFEST}…"
response=$(curl -sS --max-time 1800 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
    -F "script=@${MANIFEST};type=text/yaml" \
    -F "file=@index-digitall.graphql")
log "provisioning response: ${response}"
# The API returns 200 with an error payload for some failures, so inspect the body.
grep -qiE '"?error|exception|failure' <<<"${response}" && die "provisioning reported a problem"

# --- 3. The module under test ------------------------------------------------------------------
# Prefer the jar CI just built (mounted at /artifacts); fall back to the released version so the
# environment is usable standalone by anyone who just wants to see the module run.
# /artifacts is ../target — the Maven output locally, and where CI puts the build job's jar.
#
# Excluding -sources/-javadoc matters: the Maven build (and so the CI artifact) contains
# augmented-search-ui-<version>-sources.jar alongside the module jar, and picking the newest match
# blindly can deploy the sources jar.
jar="${MODULE_JAR:-}"
if [[ -z "${jar}" ]]; then
    jar=$(find /artifacts -maxdepth 1 -name 'augmented-search-ui-*.jar' \
            ! -name '*-sources.jar' ! -name '*-javadoc.jar' -printf '%T@ %p\n' 2>/dev/null \
          | sort -rn | head -1 | cut -d' ' -f2-)
fi
if [[ -n "${jar}" && -f "${jar}" ]]; then
    log "deploying $(basename "${jar}")…"
    deploy=$(curl -sS --max-time 600 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
        -F "script=[{\"installOrUpgradeBundle\": [\"$(basename "${jar}")\"], \"autoStart\": true}];type=application/json" \
        -F "file=@${jar}")
    log "deploy response: ${deploy}"
    grep -qiE '"?error|exception|failure' <<<"${deploy}" && die "module deployment reported a problem"
else
    log "no local jar found — installing the released augmented-search-ui from the app store"
    curl -sS --max-time 600 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
        -H 'Content-Type: application/json' \
        --data '[{"installBundle":["mvn:org.jahia.modules/augmented-search-ui/4.0.0"],"autoStart":true,"uninstallPreviousVersion":true}]'
fi

# --- 4. Enable the module on the site ----------------------------------------------------------
log "enabling augmented-search-ui on ${SITE_KEY}…"
# Note: this operation returns an EMPTY body on success — silence is success, not failure.
curl -sS --max-time 120 "${AUTH[@]}" -X POST "${JAHIA_URL}/modules/api/provisioning" \
    -H 'Content-Type: application/json' \
    --data "[{\"enable\":\"augmented-search-ui\",\"site\":\"${SITE_KEY}\"}]"

# --- 5. Place and publish the search component -------------------------------------------------
if graphql "query { jcr(workspace: EDIT) { nodeByPath(path: \"${COMPONENT_PATH}\") { uuid } } }" \
        | grep -q '"uuid"'; then
    log "component already present at ${COMPONENT_PATH}"
else
    log "adding sui:augmentedSearch at ${COMPONENT_PATH}…"
    graphql "mutation { jcr { addNode(parentPathOrId: \"/sites/${SITE_KEY}/home/landing\", name: \"augmented-search\", primaryNodeType: \"sui:augmentedSearch\") { uuid } } }" \
        | tee /dev/stderr | grep -q '"uuid"' || die "could not create the search component"
fi
log "publishing…"
graphql "mutation { jcr(workspace: EDIT) { mutateNode(pathOrId: \"${COMPONENT_PATH}\") { publish(languages: [\"en\",\"fr\",\"de\"]) } } }" \
    | tee /dev/stderr | grep -q '"publish":true' || die "could not publish the search component"

# --- 6. Indexation actually finished -----------------------------------------------------------
# Indexation is asynchronous and its mutation reports success even when the job later fails, so the
# only trustworthy check is that non-empty indices exist.
indexed() {
    local docs
    docs=$(curl -sf "${ELASTICSEARCH_URL}/_cat/indices/jahia_as*?h=docs.count" 2>/dev/null \
           | tr -d ' ' | grep -vE '^0?$' | head -1)
    [[ -n "${docs}" ]] && return 0
    return 1
}
wait_for "Augmented Search indices to hold documents" 900 indexed
curl -sf "${ELASTICSEARCH_URL}/_cat/indices/jahia_as*?v&h=index,docs.count" || true

log "environment ready — handing over to the tests"
exec "$@"
