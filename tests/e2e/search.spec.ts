import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import {
  DEFAULT_PAGE_SIZE,
  KNOWN_QUERY,
  NO_MATCH_QUERY,
  NO_RESULTS_MESSAGE,
  TOTAL_RESULTS,
} from '../support/expected.js';

/** Core search behaviour: what the component does on load, while typing, and when nothing matches. */
test.describe('search', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
  });

  test('searches on initial load, without the user doing anything', async () => {
    // SearchProvider is configured with alwaysSearchOnInitialLoad: true, so an empty query runs
    // immediately and the component is never in an empty state on arrival.
    await expect(search.pagingInfo).toHaveText(
      `Showing 1 - ${DEFAULT_PAGE_SIZE} out of ${TOTAL_RESULTS}`,
    );
    await expect(search.results).toHaveCount(DEFAULT_PAGE_SIZE);
    await expect(search.input).toHaveValue('');
  });

  test('a free-text query narrows the results', async () => {
    await search.search(KNOWN_QUERY.term);

    await expect(search.pagingInfo).toContainText(`out of ${KNOWN_QUERY.hits}`);
    // PagingInfo appends the term it searched for.
    await expect(search.pagingInfo).toContainText(`for: ${KNOWN_QUERY.term}`);
    await expect(search.results.first()).toBeVisible();
  });

  test('searches as you type, with no submit', async () => {
    // debounceLength is 0 and searchAsYouType is on, so each change triggers a search. Typing a
    // longer, more specific term must strictly reduce the result count.
    await search.search('a');
    await expect(search.pagingInfo).toBeVisible();
    const broad = await search.pagingInfo.innerText();

    await search.search('annual filings');
    await expect(search.pagingInfo).not.toHaveText(broad);

    const totalOf = (text: string) => Number(text.match(/out of (\d+)/)![1]);
    expect(totalOf(await search.pagingInfo.innerText()))
      .toBeLessThan(totalOf(broad));
  });

  test('the submit button is present and labelled', async () => {
    // SearchInput renders the button as an <input type="submit"> whose value carries the label.
    await expect(search.submitButton).toHaveValue('Search');
  });

  test('shows the empty state when nothing matches, and hides the result chrome', async () => {
    await search.search(NO_MATCH_QUERY);

    await expect(search.app).toContainText(NO_RESULTS_MESSAGE);
    await expect(search.results).toHaveCount(0);
    // ViewWrapper renders a fallback for the header and footer regions too, so paging info,
    // results-per-page and the pager all disappear rather than showing "0 - 0 out of 0".
    await expect(search.pagingInfo).toHaveCount(0);
    await expect(search.pageSizeLabel).toHaveCount(0);
    await expect(search.pagination).toHaveCount(0);
  });

  test('recovers from the empty state when the query is corrected', async () => {
    await search.search(NO_MATCH_QUERY);
    await expect(search.app).toContainText(NO_RESULTS_MESSAGE);

    await search.search(KNOWN_QUERY.term);
    await expect(search.pagingInfo).toContainText(`out of ${KNOWN_QUERY.hits}`);
    await expect(search.app).not.toContainText(NO_RESULTS_MESSAGE);
  });

  test('survives special characters without breaking the query', async () => {
    // The connector escapes the term into a GraphQL string; these inputs used to break it, and there
    // are regression snapshots for them in the connector's own suite.
    for (const term of ['digitall"', 'digitall\\', 'a & b', "quote'", 'slash/es', 'colon:value']) {
      await search.search(term);
      // The assertion is that the component keeps working — either results or the empty state, never
      // a crash that unmounts the app.
      await expect(search.input).toHaveValue(term);
      await expect(search.app).toBeVisible();
      await expect(async () => {
        const hasResults = (await search.results.count()) > 0;
        const hasEmptyState = (await search.app.innerText()).includes(NO_RESULTS_MESSAGE);
        expect(hasResults || hasEmptyState).toBe(true);
      }).toPass();
    }
  });
});
