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
| `provision.sh` | Waits for Jahia, applies the manifest, deploys/enables the module, places the component, waits for indices — then runs the tests. |
| `e2e/` | Playwright specs. |
| `results/` | Reports, traces, screenshots (git-ignored). |

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
