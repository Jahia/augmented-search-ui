# Stock ES plus the analysis plugins the module needs
#
# If a future augmented-search adds a language, check its settings_<lang>.json `requires` and add it here.
# https://github.com/Jahia/augmented-search/tree/main/api/src/main/resources/META-INF/configurations
#
# Same ES version as declared in https://github.com/Jahia/elasticsearch-connector/blob/main/pom.xml

ARG ES_BASE_IMAGE=docker.elastic.co/elasticsearch/elasticsearch:9.1.3
FROM ${ES_BASE_IMAGE}

RUN elasticsearch-plugin install --batch \
        analysis-icu \
        analysis-stempel \
        analysis-kuromoji
