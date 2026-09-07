# The Playwright suite

End-to-end tests, run **on bare metal** against the same local stack you develop against. No
test-runner container: the suite runs from the root package, on your machine and on CI alike.

## Run it

```bash
mise start          # if the stack isn't up and provisioned yet (~15 min, cold)
mise test           # or test:ui / test:headed; mise report opens the last HTML report
```

Anything after `mise test --` reaches Playwright: `mise test -- tests/e2e/facets.spec.ts -g tags`.

The suite needs an **already-provisioned** environment and deliberately does not build one —
provisioning takes ~5 minutes and mutates shared site content, so it belongs to `mise start`. See
[`../dev/README.md`](../dev/README.md).

## Layout

| File                      | Purpose                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `../playwright.config.ts` | Config, at the repo root with the package that owns the dependency. Reads its target from `../.env`. |
| `e2e/`                    | The specs (see below).                                                                               |
| `support/`                | `expected.ts` (the values the suite asserts) and `search-page.ts` (all DOM knowledge).               |
| `results/`                | Reports, traces, screenshots, videos (git-ignored).                                                  |

## What the suite covers

75 tests, written as a **characterisation suite**: they record what the module does in its JSP version, so the
migration to a Jahia JavaScript module can be verified rather than hoped for.

| Spec                         | Covers                                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke.spec.ts`              | The environment is wired up: component mounts, a search returns results, the API answers.                                                                                                   |
| `search.spec.ts`             | Search on initial load, free-text queries, search-as-you-type, the empty state and recovery from it, special characters.                                                                    |
| `results.spec.ts`            | The custom ResultView: link, title, node-type label, path breadcrumb, icon, type colour, date/author line, highlighted HTML excerpt.                                                        |
| `facets.spec.ts`             | Tags facet (values, counts, filtering, URL, deselection, checkbox state), the conditional Author facet, the absent Keywords facet, the date-range facet, and filters combined with a query. |
| `tree-facet.spec.ts`         | The bespoke Categories tree: rendering, counts, select/deselect, URL filter shape, the underline-only selection state, leaf nodes, the "+ More" threshold.                                  |
| `sorting-and-paging.spec.ts` | Four sort options and their URL parameters, PagingInfo wording, page navigation, disjoint pages, results-per-page.                                                                          |
| `i18n.spec.ts`               | English, French and German chrome, results following the page language — **and one known bug** (below).                                                                                     |
| `url-state.spec.ts`          | Query state in the URL and restoration from deep links: term, page, page size, sorting, facet filters, a full round-trip and back-navigation.                                               |
| `api.spec.ts`                | The Augmented Search GraphQL API directly: guest LIVE, relevance ordering, EDIT for guests vs editors, and the `Origin` requirement.                                                        |

### One bug is pinned as current behaviour

The suite asserts it **as it is**, so a refactor cannot change it by accident. When it is deliberately
fixed, invert the matching assertion in the same commit so the change shows up in review.

1. **The empty-results message is never translated.** `SearchView` passes a literal
   `fallbackView="Nothing was found"` instead of the `search.fallbackMsg` key, which exists in all
   three bundles.

Two others were fixed that way, and their assertions now read the right way round: dates were always
French (the old bootstrap set moment's locale on a throwaway instance), and German chrome was English
(the module registered only `en` and `fr` before the bundles moved to `settings/locales/`).

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

## Where it points, and debugging

At `JAHIA_URL`, else `http://localhost:$JAHIA_PORT` from `../.env` — the same file compose reads, so
moving the stack's port moves the suite. An exported variable wins, so a one-off is
`JAHIA_URL=http://localhost:9090 mise test`. Authenticating specs use `JAHIA_USER`.

`results/` holds the HTML report plus a trace, screenshot and video per failure (`mise report` opens
it); CI uploads the same directory as `integration-test-results` with `containers.log`. If a failure
looks environmental rather than behavioural, it usually is — see
[`../dev/README.md`](../dev/README.md).
