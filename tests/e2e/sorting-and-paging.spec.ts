import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import {
  DEFAULT_PAGE_SIZE,
  FIRST_BY_CREATED,
  FIRST_BY_TITLE,
  LABELS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  TOTAL_RESULTS,
} from '../support/expected.js';

/** Sorting, paging, and the two custom views that surround the results (PagingInfo, ResultsPerPage). */
test.describe('sorting', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });

  test('defaults to relevance', async () => {
    await expect(search.sortLabel).toHaveText(new RegExp(`^${LABELS.en.sortBy}$`, 'i'));
    await expect(search.selectedValueOf('sorting')).toHaveText(SORT_OPTIONS.relevance.label);
  });

  test('offers the four configured options, in order', async () => {
    await search.app.locator('.sui-sorting .sui-select__control').click();
    await expect(search.page.locator('.sui-select__option')).toHaveText([
      SORT_OPTIONS.created.label,
      SORT_OPTIONS.modified.label,
      SORT_OPTIONS.relevance.label,
      SORT_OPTIONS.title.label,
    ]);
  });

  test('sorting by title reorders the results and records the field in the URL', async () => {
    const firstBefore = await search.resultTitles.first().innerText();

    await search.sortBy(SORT_OPTIONS.title.label);

    await expect(search.resultTitles.first()).toHaveText(FIRST_BY_TITLE);
    expect(await search.resultTitles.first().innerText()).not.toBe(firstBefore);
    await expect(async () => {
      const params = search.urlParams();
      expect(params.get('sort-field')).toBe(SORT_OPTIONS.title.field);
      expect(params.get('sort-direction')).toBe(SORT_OPTIONS.title.direction);
    }).toPass();
  });

  test('sorting by creation date reorders again, descending', async () => {
    await search.sortBy(SORT_OPTIONS.created.label);

    await expect(search.resultTitles.first()).toHaveText(FIRST_BY_CREATED);
    await expect(async () => {
      const params = search.urlParams();
      expect(params.get('sort-field')).toBe(SORT_OPTIONS.created.field);
      expect(params.get('sort-direction')).toBe(SORT_OPTIONS.created.direction);
    }).toPass();
  });

  test('returning to relevance clears the sort from the URL', async () => {
    await search.sortBy(SORT_OPTIONS.title.label);
    await expect(async () => {
      expect(search.urlParams().get('sort-field')).toBe(SORT_OPTIONS.title.field);
    }).toPass();

    // Relevance is configured with empty field and direction, so Search UI drops the parameters.
    await search.sortBy(SORT_OPTIONS.relevance.label);
    await expect(async () => {
      expect(search.urlParams().get('sort-field')).toBeFalsy();
    }).toPass();
  });

  test('sorting does not change how many results match', async () => {
    await search.sortBy(SORT_OPTIONS.title.label);
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });
});

test.describe('paging', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });

  test('PagingInfo reports the window and the total', async () => {
    // The custom PagingInfo view composes translated fragments around <strong> elements.
    await expect(search.pagingInfo).toHaveText(
      `Showing 1 - ${DEFAULT_PAGE_SIZE} out of ${TOTAL_RESULTS}`,
    );
    await expect(search.pagingInfo.locator('strong').first()).toHaveText(
      `1 - ${DEFAULT_PAGE_SIZE}`,
    );
    await expect(search.pagingInfo.locator('strong').nth(1)).toHaveText(String(TOTAL_RESULTS));
  });

  test('PagingInfo appends the search term only when there is one', async () => {
    await expect(search.pagingInfo).not.toContainText('for:');

    await search.search('movies');
    await expect(search.pagingInfo).toContainText('for: movies');
    // The term is emphasised.
    await expect(search.pagingInfo.locator('em')).toHaveText('movies');
  });

  test('paginates the full result set', async () => {
    const expectedPages = Math.ceil(TOTAL_RESULTS / DEFAULT_PAGE_SIZE);
    await expect(search.app.locator('li.rc-pagination-item')).toHaveCount(expectedPages);
    await expect(search.activePage).toHaveText('1');
  });

  test('moving to page two advances the window and records it in the URL', async () => {
    await search.gotoPage(2);

    await expect(search.pagingInfo).toHaveText(
      `Showing ${DEFAULT_PAGE_SIZE + 1} - ${DEFAULT_PAGE_SIZE * 2} out of ${TOTAL_RESULTS}`,
    );
    await expect(search.activePage).toHaveText('2');
    await expect(async () => {
      expect(search.urlParams().get('current')).toBe('n_2_n');
    }).toPass();
  });

  test('the last page holds the remainder', async () => {
    const lastPage = Math.ceil(TOTAL_RESULTS / DEFAULT_PAGE_SIZE);
    const remainder = TOTAL_RESULTS % DEFAULT_PAGE_SIZE || DEFAULT_PAGE_SIZE;

    await search.gotoPage(lastPage);

    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
    await expect(search.results).toHaveCount(remainder);
  });

  test('pages hold disjoint sets of documents', async () => {
    // Compare LINKS, not titles. Digitall contains several documents that share a display name (a
    // handful of person records are all called "Taber", "Taylor", …), so overlapping titles across
    // pages is expected and says nothing about paging. The href is the identity.
    const hrefs = () =>
      search.app
        .locator('.result a')
        .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));

    const firstPage = await hrefs();

    await search.gotoPage(2);
    // The pager marks page 2 active immediately, while the results are still the previous page's.
    // Wait for the RESULT WINDOW to move, not just the pager, or this compares page 1 against itself.
    await expect(search.pagingInfo).toHaveText(
      `Showing ${DEFAULT_PAGE_SIZE + 1} - ${DEFAULT_PAGE_SIZE * 2} out of ${TOTAL_RESULTS}`,
    );
    const secondPage = await hrefs();

    expect(secondPage).not.toEqual(firstPage);
    // No document may appear on both pages — that would mean an unstable sort.
    expect(secondPage.filter((h) => firstPage.includes(h))).toEqual([]);
  });
});

test.describe('results per page', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });

  test('is labelled and defaults to 20', async () => {
    await expect(search.pageSizeLabel).toHaveText(LABELS.en.show);
    await expect(search.selectedValueOf('results-per-page')).toHaveText(
      String(DEFAULT_PAGE_SIZE),
    );
  });

  test('offers 20, 40 and 60', async () => {
    await search.app.locator('.sui-results-per-page .sui-select__control').click();
    await expect(search.page.locator('.sui-select__option')).toHaveText([...PAGE_SIZE_OPTIONS]);
  });

  test('changing the page size resizes the result window', async () => {
    await search.setPageSize('40');

    await expect(search.pagingInfo).toHaveText(`Showing 1 - 40 out of ${TOTAL_RESULTS}`);
    await expect(search.results).toHaveCount(40);
    await expect(async () => {
      expect(search.urlParams().get('size')).toBe('n_40_n');
    }).toPass();
  });

  test('a larger page size reduces the number of pages', async () => {
    await search.setPageSize('60');
    await expect(search.results).toHaveCount(60);
    // 61 results at 60 per page is 2 pages.
    await expect(search.app.locator('li.rc-pagination-item')).toHaveCount(2);
  });
});
