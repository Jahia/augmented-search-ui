import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import {
  DEFAULT_PAGE_SIZE,
  FACETS,
  KNOWN_QUERY,
  SORT_OPTIONS,
  TOTAL_RESULTS,
} from '../support/expected.js';

/**
 * Query state in the URL.
 *
 * Search UI's `trackUrlState` defaults to on, so the query, page, page size, sort and filters are all
 * mirrored into the query string. That makes search results shareable and bookmarkable, and it is
 * behaviour a re-platform can easily lose — the state lives in the client, and an SSR-first rewrite
 * would have to reproduce it deliberately.
 */
test.describe('URL query state', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
  });

  test('records the page size even before the user touches anything', async () => {
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
    await expect(async () => {
      expect(search.urlParams().get('size')).toBe(`n_${DEFAULT_PAGE_SIZE}_n`);
    }).toPass();
  });

  test('records the search term', async () => {
    await search.goto('en');
    await search.search(KNOWN_QUERY.term);
    await expect(async () => {
      expect(search.urlParams().get('q')).toBe(KNOWN_QUERY.term);
    }).toPass();
  });

  test('restores a search term from a deep link', async () => {
    await search.goto('en', `q=${KNOWN_QUERY.term}&size=n_${DEFAULT_PAGE_SIZE}_n`);

    // The input is rehydrated from the URL, not just the results.
    await expect(search.input).toHaveValue(KNOWN_QUERY.term);
    await expect(search.pagingInfo).toContainText(`out of ${KNOWN_QUERY.hits}`);
    await expect(search.pagingInfo).toContainText(`for: ${KNOWN_QUERY.term}`);
  });

  test('restores the page number from a deep link', async () => {
    await search.goto('en', `current=n_2_n&size=n_${DEFAULT_PAGE_SIZE}_n`);

    await expect(search.activePage).toHaveText('2');
    await expect(search.pagingInfo).toHaveText(
      `Showing ${DEFAULT_PAGE_SIZE + 1} - ${DEFAULT_PAGE_SIZE * 2} out of ${TOTAL_RESULTS}`,
    );
  });

  test('restores the page size from a deep link', async () => {
    await search.goto('en', 'size=n_40_n');

    await expect(search.selectedValueOf('results-per-page')).toHaveText('40');
    await expect(search.results).toHaveCount(40);
  });

  test('restores sorting from a deep link', async () => {
    await search.goto(
      'en',
      `size=n_${DEFAULT_PAGE_SIZE}_n&sort-field=${encodeURIComponent(SORT_OPTIONS.title.field)}&sort-direction=${SORT_OPTIONS.title.direction}`,
    );

    await expect(search.selectedValueOf('sorting')).toHaveText(SORT_OPTIONS.title.label);
  });

  test('restores a facet filter from a deep link', async () => {
    const { value, count } = FACETS.tags[0];
    // Encode with URLSearchParams: the raw brackets and the colon in `jcr:tags` must be
    // percent-encoded or Jahia never serves the page, and the component simply never mounts.
    const filter = new URLSearchParams({
      'filters[0][field]': 'jcr:tags',
      'filters[0][values][0]': value,
      'filters[0][type]': 'all',
      'filters[0][persistent]': 'false',
    }).toString();

    await search.goto('en', `size=n_${DEFAULT_PAGE_SIZE}_n&${filter}`);

    await expect(search.pagingInfo).toContainText(`out of ${count}`);
    await expect(
      search.facetOption(/^tags$/i, value).locator('input[type="checkbox"]'),
    ).toBeChecked();
  });

  test('a full round-trip reproduces the same view', async () => {
    // Build up state through the UI, then reload the resulting URL and expect the same thing back.
    await search.goto('en');
    await search.search(KNOWN_QUERY.term);
    await expect(search.pagingInfo).toContainText(`for: ${KNOWN_QUERY.term}`);
    await search.sortBy(SORT_OPTIONS.title.label);
    await expect(search.selectedValueOf('sorting')).toHaveText(SORT_OPTIONS.title.label);
    await search.setPageSize('40');
    await expect(search.selectedValueOf('results-per-page')).toHaveText('40');

    // Only capture the URL once every piece of state has actually reached it — the UI updates before
    // the query string does, so reading it too early yields a partial URL.
    await expect(async () => {
      const params = search.urlParams();
      expect(params.get('q')).toBe(KNOWN_QUERY.term);
      expect(params.get('size')).toBe('n_40_n');
      expect(params.get('sort-field')).toBe(SORT_OPTIONS.title.field);
    }).toPass();

    const built = search.page.url();
    const before = await search.resultTitles.allInnerTexts();

    await search.page.goto(built);
    await search.waitUntilMounted();

    await expect(search.input).toHaveValue(KNOWN_QUERY.term);
    await expect(search.selectedValueOf('sorting')).toHaveText(SORT_OPTIONS.title.label);
    await expect(search.selectedValueOf('results-per-page')).toHaveText('40');
    await expect(async () => {
      expect(await search.resultTitles.allInnerTexts()).toEqual(before);
    }).toPass();
  });

  test('the browser back button returns to the previous search', async () => {
    // Navigate to both states EXPLICITLY rather than typing and then going back.
    //
    // Search UI decides per change whether to push or replace the history entry, and the choice is
    // timing-dependent: type quickly and the entry is replaced, so `goBack()` leaves the page
    // altogether (to about:blank in a fresh context) and the component no longer exists. That made a
    // type-then-back test flaky for reasons that have nothing to do with this module.
    //
    // Two real navigations always create two history entries, so this tests the behaviour users care
    // about — going back restores the earlier search — deterministically.
    await search.goto('en', `size=n_${DEFAULT_PAGE_SIZE}_n`);
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);

    await search.goto('en', `q=${KNOWN_QUERY.term}&size=n_${DEFAULT_PAGE_SIZE}_n`);
    await expect(search.input).toHaveValue(KNOWN_QUERY.term);
    await expect(search.pagingInfo).toContainText(`out of ${KNOWN_QUERY.hits}`);

    await search.page.goBack();
    // The page reloads and the app remounts, so wait for the mount before asserting.
    await search.waitUntilMounted();
    await expect(search.input).toHaveValue('');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });
});
