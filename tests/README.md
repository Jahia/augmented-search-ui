# Test / demo environment

A complete Jahia + Augmented Search environment for this module: Jahia, Elasticsearch, the Digitall
demo site indexed for search, and `augmented-search-ui` deployed on top.

Two audiences, one environment:

- **CI** — integration tests run against it on every change.
- **You, or a customer** — the fastest way to see this module actually working before forking it.

Everything is pinned to **stable, released versions**, on purpose. If you add a coordinate here,
never point it at a `-SNAPSHOT`.

## What you need

- Docker with Compose v2
- **A Jahia licence.** We can't ship one. Export it base64-encoded:
  ```bash
  export JAHIA_LICENSE=$(base64 -i /path/to/your/license.xml)
  ```
  (Augmented Search is licence-gated — see Troubleshooting.)

## Run it

```bash
cd tests
export JAHIA_LICENSE=$(base64 -i /path/to/your/license.xml)

# Start the platform. Jahia takes a few minutes on a cold start.
docker compose up -d elasticsearch jahia

# Provision the environment and run the tests.
docker compose up --build --abort-on-container-exit playwright
```

Then open <http://localhost:8080/sites/digitall/home.html> (`root` / `root1234`) — the search
component sits on the Digitall home page. Elasticsearch is on <http://localhost:9200>.

The test container provisions before testing, so the first run takes a while: Digitall is installed
and imported, Augmented Search is configured, and the site is indexed.

To test the module you just built, build it first — the jar in `../target` is picked up
automatically:

```bash
(cd .. && mvn clean package -DskipTests)
```

Without a local jar, the released version is installed instead, so the environment still works
standalone.

## Layout

| File | Purpose |
|---|---|
| `docker-compose.yml` | The environment: `mariadb`, `elasticsearch`, `jahia`, `playwright`. |
| `elasticsearch/Dockerfile` | Elasticsearch **plus the analysis plugins Augmented Search needs**. |
| `provisioning-manifest-stable.yml` | The platform: Digitall, Augmented Search, the JS-modules engine, ES configuration. |
| `index-digitall.graphql` | Registers Digitall with Augmented Search and starts indexation. |
| `provision.sh` | Waits for Jahia, applies the manifest, deploys/enables the module, places the component, waits for indexation to settle — then runs the tests. |
| `e2e/` | Playwright specs (see below). |
| `support/` | `expected.ts` (the values the suite asserts) and `search-page.ts` (all DOM knowledge). |
| `results/` | Reports, traces, screenshots (git-ignored). |

## What the suite covers

75 tests, written as a **characterisation suite**: they record what the module does *today*, so the
migration to a Jahia JavaScript module can be verified rather than hoped for.

| Spec | Covers |
|---|---|
| `smoke.spec.ts` | The environment is wired up: component mounts, a search returns results, the API answers. |
| `search.spec.ts` | Search on initial load, free-text queries, search-as-you-type, the empty state and recovery from it, special characters. |
| `results.spec.ts` | The custom ResultView: link, title, node-type label, path breadcrumb, icon, type colour, date/author line, highlighted HTML excerpt. |
| `facets.spec.ts` | Tags facet (values, counts, filtering, URL, deselection, checkbox state), the conditional Author facet, the absent Keywords facet, the date-range facet, and filters combined with a query. |
| `tree-facet.spec.ts` | The bespoke Categories tree: rendering, counts, select/deselect, URL filter shape, the underline-only selection state, leaf nodes, the "+ More" threshold. |
| `sorting-and-paging.spec.ts` | Four sort options and their URL parameters, PagingInfo wording, page navigation, disjoint pages, results-per-page. |
| `i18n.spec.ts` | English and French chrome, results following the page language — **and three known bugs** (below). |
| `url-state.spec.ts` | Query state in the URL and restoration from deep links: term, page, page size, sorting, facet filters, a full round-trip and back-navigation. |
| `api.spec.ts` | The Augmented Search GraphQL API directly: guest LIVE, relevance ordering, EDIT for guests vs editors, and the `Origin` requirement. |

### Three bugs are pinned as current behaviour

The suite asserts these **as they are**, so the migration cannot change them by accident. When one is
deliberately fixed, invert the matching assertion in the same commit so the change shows up in review.

1. **German chrome is English.** `i18n/resources.js` registers only `en` and `fr`; `i18n/de.json`
   exists and is complete but is never loaded, so i18next falls back to English.
2. **Dates are always French.** `app/index.js` does `import 'moment/locale/fr'`, which makes French
   moment's global default; the intended `moment().locale(lang)` sets the locale on a throwaway
   instance rather than globally (`moment.locale(...)`).
3. **The empty-results message is never translated.** `SearchView` passes a literal
   `fallbackView="Nothing was found"` instead of the `search.fallbackMsg` key, which exists in all
   three bundles.

### Writing more tests

Put DOM knowledge in `support/search-page.ts`, not in specs — the suite may move to Cypress later.
Four traps, all of which cost a debugging cycle here:

- **Don't select `input[type="text"]`.** Elastic's SearchBox renders its field with no `type`
  attribute, so an attribute selector cannot match it. Use the textbox role.
- **Don't select on the tree facet's classes.** They are styled-components hashes that change per
  build.
- **Don't put a comma-separated CSS list inside a chained locator.** Playwright splits it at the top
  level and the second alternative escapes the container scope.
- **Percent-encode `filters[0][field]=jcr:tags` style deep links.** Raw brackets and colons stop Jahia
  serving the page, and the component then never mounts — which looks like a broken test.

Assertions about content live in `support/expected.ts` and are deliberately exact. A fuzzy assertion
detects no regression. If one fails after a version bump, confirm the behaviour really changed before
editing the number.

## Running the tests from your host

Useful while writing specs — you get `--headed` and `--ui`:

```bash
cd tests && npm install
JAHIA_URL=http://localhost:8080 npm run test:ui
```

This assumes the environment is already provisioned (i.e. you have run the `playwright` service at
least once).

## Troubleshooting

**Every search fails, and Elasticsearch has no `jahia_as*` indices.**
Indexation is asynchronous, and its mutation reports success *even when the job then fails* — so
never trust the provisioning output. Check the end state:
```bash
curl 'http://localhost:9200/_cat/indices?v'
docker compose logs jahia | grep -iE 'ReindexJob|ERROR'
```

**`failed to find tokenizer under name [icu_tokenizer]`.**
Elasticsearch is missing Augmented Search's analysis plugins. That's why `elasticsearch` is built
from `elasticsearch/Dockerfile` rather than pulled — if you point `ELASTICSEARCH_IMAGE` at stock
Elasticsearch, you get exactly this.

**`augmented-search` installs but never starts.**
It is licence-gated (`require-capability … search-provider-elasticsearch`). A licence without the
Augmented Search entitlement leaves the bundle installed and stopped, which looks like a deployment
bug. Check with `docker compose logs jahia | grep augmented-search`.

**GraphQL returns `Permission denied` for everything.**
The request is missing an `Origin` header matching the Jahia URL — without it Jahia treats the call
as unauthenticated, whatever credentials you sent. Basic auth is fine; the header is what's missing.

**Jahia answers `/cms/login` but nothing is provisioned yet.**
Readiness is not the same as provisioned. `provision.sh` waits for the real end state; if you're
driving things by hand, do the same.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `JAHIA_LICENSE` | *(none — required)* | Base64-encoded licence content. |
| `JAHIA_IMAGE` | `jahia/jahia-ee:8.2` | Jahia image. CI may point this at a snapshot. |
| `ES_BASE_IMAGE` | `docker.elastic.co/elasticsearch/elasticsearch:9.1.3` | Base for the built ES image. Keep in step with the client `elasticsearch-connector` bundles. |
| `SUPER_USER_PASSWORD` | `root1234` | Jahia `root` password. |
| `MANIFEST` | `provisioning-manifest-stable.yml` | Provisioning manifest to apply. |
| `MODULE_JAR` | *(auto-detected in `/artifacts`)* | Explicit path to the module jar to deploy. |
| `JAHIA_DEBUG` | `false` | Enable JPDA on `:8000`. |
