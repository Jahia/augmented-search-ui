|  | Badges | 
| --- | --- |
| Module | ![ID](https://img.shields.io/badge/ID-augmented--search--ui-blue) [![Store](https://img.shields.io/badge/Jahia%20Store-Yes-brightgreen)](https://store.jahia.com/contents/modules-repository/org/jahia/modules/augmented-search-ui.html) |
| Tests | [![Case Management](https://img.shields.io/badge/Case%20Management-Testrail-blue)](https://jahia.testrail.net/index.php?/projects/overview/20) |
| CI / CD | [![CircleCI](https://circleci.com/gh/Jahia/augmented-search-ui/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/Jahia/augmented-search) ![Unit Tests](https://img.shields.io/badge/Unit%20Tests-No-red) ![Integration Tests](https://img.shields.io/badge/Integration%20Tests-No-red) ![Build Snapshot](https://img.shields.io/badge/Build%20Snapshot-Yes-brightgreen) ![Build Release](https://img.shields.io/badge/Build%20Release-No-red) |
| Artifacts | [![Snapshot](https://img.shields.io/badge/Snapshot-Nexus-blue)](https://devtools.jahia.com/nexus/content/repositories/jahia-enterprise-snapshots/org/jahia/modules/augmented-search-ui/) [![Release](https://img.shields.io/badge/Release-Nexus-blue)](https://devtools.jahia.com/nexus/content/repositories/jahia-enterprise-releases/org/jahia/modules/augmented-search-ui/) |
| Slack | [![Discussion](https://img.shields.io/badge/Discussion-%23module--augmented--search-blue)](https://jahia.slack.com/archives/C013904SBRA) [![Notifications](https://img.shields.io/badge/Notifications-%23cci--augmented--search-blue)](https://jahia.slack.com/archives/CSMQ0DRHA)|

<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

Augmented Search UI
==========================

<p align="center">This repository is a sample UI module to integrate Jahia Augmented Search in your site. You can use it as the starting point to customize your search experience.</p>

![screenshot](./img/augmented-ui-example.jpg)

## Table of content

- [Presentation](#presentation)
- [Development](#development)
- [Production](#production)

## Presentation

This module provides an easy way to quickly integrate Augmented Search in your project and provides a reference implementation to base your integration upon.

You can find more details on how to integrate this module in your site on [Jahia Academy](https://academy.jahia.com/documentation/developer#augmented-search).

If you want to customize the module, more details about our GraphQL API for augmented search is [available here](https://academy.jahia.com/documentation/developer/augmented-search/2.1/querying/writing-a-query#top).

Augmented Search is available on [Jahia App Store](https://store.jahia.com/contents/modules-repository/packages/Augmented%20Search.html)

## Development

* Run `yarn` to install dependencies
* Makes sure to link/copy `search-ui-jahia-connector` to your development version
* Deploy module on Jahia
* Add module to Academy website
* Publish Academy
* Create a page with `Free` template and add `search-ui` component
* Change server name to `localhost`   

## Production

Download the module from store.jahia.com and deploy it on your platform
