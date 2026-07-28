# Elasticsearch for augmented-search — stock ES plus the analysis plugins the module needs.
#
# WHY this image exists instead of using stock Elasticsearch: augmented-search creates its indices
# with analyzers that live in plugins. Without them index creation fails and the reindex job dies
# with, e.g.
#   [illegal_argument_exception] Custom Analyzer [fr_phrase_shingle_analyzer]
#   failed to find tokenizer under name [icu_tokenizer]
# — which reads like a Jahia bug but is a missing ES plugin. The module declares what it needs in
# its own configuration (`META-INF/configurations/settings*.json`, the `requires` key):
#
#   analysis-icu       — icu_tokenizer, used by the DEFAULT settings.json -> always required
#   analysis-stempel   — settings_pl.json (Polish: polish/polish_stop/polish_stem)
#   analysis-kuromoji  — settings_ja.json (Japanese: kuromoji_tokenizer/kuromoji_stemmer)
#
# All three are installed so the environment works whatever site languages are used. If a future
# augmented-search adds a language, check its settings_<lang>.json `requires` and add it here.
#
# Keep the ES version in step with the client augmented-search bundles: elasticsearch-connector 4.x
# ships co.elastic.clients:elasticsearch-java 9.1.3, so a 9.1.x server.

ARG ES_BASE_IMAGE=docker.elastic.co/elasticsearch/elasticsearch:9.1.3
FROM ${ES_BASE_IMAGE}

RUN elasticsearch-plugin install --batch \
        analysis-icu \
        analysis-stempel \
        analysis-kuromoji
