import { test, expect } from '@playwright/test';

/**
 * Smoke test: is the environment actually wired up end to end?
 *
 * This is intentionally shallow — it proves Jahia, Augmented Search, Elasticsearch and the module
 * are all talking to each other. The behavioural suite that pins down search, facets, paging,
 * sorting and i18n comes on top of this.
 */

const HOME = '/sites/digitall/home.html';

test.describe('augmented-search-ui smoke', () => {
  test('the search component renders on the Digitall home page', async ({ page }) => {
    await page.goto(HOME);

    // The module mounts into a container id'd by the content node's uuid.
    const container = page.locator('[id^="augmentedSearchUIApp_"]');
    await expect(container).toBeAttached();

    // A search input appears only once the React app has mounted and replaced "Loading...".
    await expect(container.locator('input[type="text"], input[type="search"]').first())
      .toBeVisible();
  });

  test('a search returns results from Augmented Search', async ({ page }) => {
    await page.goto(HOME);

    const container = page.locator('[id^="augmentedSearchUIApp_"]');
    const input = container.locator('input[type="text"], input[type="search"]').first();
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

  test('Augmented Search answers the GraphQL search query', async ({ request }) => {
    // A direct API check, so a UI regression and a broken index give different failures.
    const response = await request.post('/modules/graphql', {
      headers: { 'Content-Type': 'application/json' },
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
