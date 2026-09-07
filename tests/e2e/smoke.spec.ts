import { test, expect } from '@playwright/test';

/**
 * Smoke test: is the environment actually wired up end to end?
 *
 * This is intentionally shallow — it proves Jahia, Augmented Search, Elasticsearch and the module
 * are all talking to each other. The behavioural suite that pins down search, facets, paging,
 * sorting and i18n comes on top of this.
 */

const HOME = '/sites/digitall/home.html';

/**
 * The module mounts into a container id'd by the content node's uuid.
 *
 * Locate the search field by ROLE, not by `input[type=...]`: Elastic's SearchBox renders
 *   <input aria-autocomplete="list" id="downshift-0-input" placeholder="Search" class="sui-search-box__text-input">
 * with **no type attribute**, so `input[type="text"]` matches nothing (a CSS attribute selector
 * needs the attribute to be present). Avoid comma-separated CSS in a chained locator too —
 * Playwright splits it at the top level, so the second alternative escapes the container scope.
 */
const searchApp = (page: import('@playwright/test').Page) =>
  page.locator('[id^="augmentedSearchUIApp_"]');
const searchInput = (page: import('@playwright/test').Page) =>
  searchApp(page).getByRole('textbox').first();

test.describe('augmented-search-ui smoke', () => {
  test('the search component renders on the Digitall home page', async ({ page }) => {
    await page.goto(HOME);

    await expect(searchApp(page)).toBeAttached();

    // The input exists only once the React app has mounted and replaced "Loading...".
    await expect(searchInput(page)).toBeVisible();
  });

  test('a search returns results from Augmented Search', async ({ page }) => {
    await page.goto(HOME);

    const container = searchApp(page);
    const input = searchInput(page);
    await expect(input).toBeVisible();

    // Wait for the search request itself rather than a fixed timeout: the module queries Jahia's
    // GraphQL endpoint, so a response carrying search data is the real signal.
    const searchResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/modules/graphql') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );

    await input.fill('digitall');
    await searchResponse;

    // Assert on a rendered result, not on the response body — that is what a user actually sees.
    await expect(container.getByRole('link').first()).toBeVisible();
  });

  test('Augmented Search answers the GraphQL search query', async ({ request, baseURL }) => {
    // A direct API check, so a UI regression and a broken index give different failures.
    //
    // The Origin header is REQUIRED and must match the Jahia origin. Browsers set it automatically
    // on POST, but Playwright's request context does not — and without it Jahia treats the call as
    // unauthenticated and answers `GqlAccessDeniedException: Permission denied`, which reads like a
    // permissions problem rather than a missing header.
    const response = await request.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json', Origin: baseURL! },
      data: {
        query: `query { search(q: "digitall", workspace: LIVE) {
                  results(size: 5) { totalHits hits { displayableName link } } } }`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.errors, `GraphQL returned errors: ${JSON.stringify(body.errors)}`).toBeUndefined();
    expect(body.data.search.results.totalHits).toBeGreaterThan(0);
  });
});
