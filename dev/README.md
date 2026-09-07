# The local environment

What turns the stack in [`../docker-compose.yml`](../docker-compose.yml) into a working Augmented
Search environment. Driven by `mise start`; you should rarely run anything in here by hand.

| File | Purpose |
|---|---|
| `provision.sh` | Waits for Jahia, applies the manifest, deploys the module, enables it on Digitall, places + publishes the component if it isn't live yet, waits for indexation to settle. |
| `provisioning/manifest.yml` | The platform: Digitall, Augmented Search, the Elasticsearch connector and its config, the JS-modules engine. |
| `provisioning/index-digitall.graphql` | Registers Digitall with Augmented Search and starts indexation. |
| `elasticsearch/Dockerfile` | Elasticsearch **plus the analysis plugins Augmented Search needs**. |

Every coordinate in the manifest is a **pinned, released version**: this doubles as the fastest way to
see the module working before forking it. Never add a `-SNAPSHOT`.

A fresh provision takes about 3–5 minutes, most of it importing and indexing Digitall.

`mise start` is idempotent, so it is also how you re-provision a live stack (`mise start -- --force`
re-applies the platform manifest). The component is only published when it is not already live, so a
re-run does not touch content. It will not repair a half-provisioned stack, though; for that,
`mise delete` and start again.

**Which module gets deployed**, in order: `MODULE_PACKAGE`, then `dist/package.tgz` (what
`yarn build` produced), then the newest `target/*.tgz` (CI's artifact), then the released version. So
`mise start` provisions your build, and someone who just wants to see the module run needs no build.

## Troubleshooting

**A bundle in the manifest silently didn't install.** Provisioning reports success per *operation*,
not per coordinate, so one unresolvable artifact in an `installBundle` list leaves no trace in the
response — `provision.sh` cannot catch it. Jahia logs it, and nothing else does:

```bash
docker compose logs jahia | grep "Cannot install"
```

**`provision.sh` reports more documents than the tests expect.** It polls as `root`; the suite runs
as an anonymous visitor, which sees one document fewer. Compare like with like before concluding the
index is wrong — an unauthenticated query is the suite's view:

```bash
curl -H 'Origin: http://localhost:8080' -H 'Content-Type: application/json' \
  -X POST http://localhost:8080/modules/graphql \
  --data '{"query":"{ search(q: \"\", workspace: LIVE) { results(size: 1) { totalHits } } }"}'
```

**Every search fails, and Elasticsearch has no `jahia_as*` indices.** Indexation is asynchronous and
reports success even when the job then fails, so check the end state (port from `ELASTICSEARCH_PORT`):

```bash
curl 'http://localhost:9200/_cat/indices?v'
docker compose logs jahia | grep -iE 'ReindexJob|ERROR'
```

**`failed to find tokenizer under name [icu_tokenizer]`.** Elasticsearch is missing the analysis
plugins — which is what you get by pointing `ELASTICSEARCH_IMAGE` at stock Elasticsearch.

**`augmented-search` installs but never starts.** It is license-gated
(`require-capability … search-provider-elasticsearch`); a license without the entitlement leaves the
bundle installed and stopped, which looks like a deployment bug.

**GraphQL returns `Permission denied` for everything.** A missing `Origin` header matching the Jahia
URL — Jahia then treats the call as unauthenticated whatever credentials you sent.

**Jahia answers `/cms/login` but nothing is provisioned.** Readiness is not provisioned, which is why
the stack has no Jahia healthcheck and `provision.sh` waits for real end states.

## Configuration

In `../.env` — see [`../.env.example`](../.env.example). `provision.sh` also honours a few variables
that have no reason to live there:

| Variable | Default | Meaning |
|---|---|---|
| `JAHIA_URL` | `http://localhost:$JAHIA_PORT` | Target instance, if not the local stack. |
| `ELASTICSEARCH_URL` | `http://localhost:$ELASTICSEARCH_PORT` | Where to check the indices. |
| `MODULE_PACKAGE` | *(auto-detected)* | Explicit path to the `.tgz` to deploy. |
| `MANIFEST` | `dev/provisioning/manifest.yml` | Platform manifest to apply. |
| `INDEX_SCRIPT` | `dev/provisioning/index-digitall.graphql` | Uploaded alongside the manifest. |
| `RELEASED_MODULE` | `mvn:org.jahia.modules/augmented-search-ui/4.0.0` | Fallback when no package is found. |
| `SITE_KEY` | `digitall` | Site to provision and index. |
