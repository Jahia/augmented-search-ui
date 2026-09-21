# Test runner image: Playwright + the provisioning tooling.
#
# The base image tag MUST match the @playwright/test version in package.json — Playwright refuses to
# run against browsers it wasn't built for.
FROM mcr.microsoft.com/playwright:v1.62.0-jammy

# jq builds the GraphQL request bodies in provision.sh; curl talks to Jahia.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl jq \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash jahians
USER jahians
WORKDIR /home/jahians

COPY --chown=jahians:jahians package.json package-lock.json* ./
# CI=true keeps the install logs terse. Browsers already live in the base image.
RUN CI=true npm install --no-audit --no-fund

COPY --chown=jahians:jahians . .

# Provision first, then run the suite; provision.sh execs its arguments once the environment is up.
ENTRYPOINT ["./provision.sh"]
CMD ["npx", "playwright", "test"]
