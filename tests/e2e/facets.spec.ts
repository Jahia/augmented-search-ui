import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import { FACETS, LABELS, NO_RESULTS_MESSAGE, TOTAL_RESULTS } from '../support/expected.js';

/** The standard (checkbox) facets, the conditional Author facet, and the date-range facet. */
test.describe('facets', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });

  test('renders exactly the facets that have values', async () => {
    await expect(search.facetTitles).toHaveText(
      // CSS uppercases the legends, so compare case-insensitively.
      LABELS.en.facetTitles.map((t) => new RegExp(`^${t}$`, 'i')),
    );
  });

  test('does not render the Author facet until a Last modified filter is active', async () => {
    // SearchView declares jcr:lastModifiedBy in `conditionalFacets`, gated on a jcr:lastModified
    // filter being present. Digitall's content IS authored (every card shows "root"), so the facet's
    // absence demonstrates the condition rather than missing data.
    await expect(search.facet(/^author$/i)).toHaveCount(0);

    // Requesting it is the observable effect: after selecting a date range, the outgoing search must
    // ask for the lastModifiedBy facet. Asserting on the request rather than on rendered options
    // matters because every range matches 0 documents on Digitall (content dates from 2016), so an
    // empty result set would render no options either way.
    const requested = search.page.waitForRequest(
      (r) =>
        r.url().includes('/modules/graphql') &&
        r.method() === 'POST' &&
        (r.postData() ?? '').includes('jcr:lastModifiedBy'),
    );
    await search.toggleFacetOption(/last modified/i, 'Last Week');
    await expect(await requested).toBeTruthy();
  });

  test('never renders the Keywords facet, which has no values in Digitall', async () => {
    await expect(search.facet(/^keywords$/i)).toHaveCount(0);
  });

  test.describe('tags facet', () => {
    test('lists each tag with its document count', async () => {
      for (const { value, count } of FACETS.tags) {
        await expect(search.facetOption(/^tags$/i, value)).toBeVisible();
        await expect(search.facetOptionCount(/^tags$/i, value)).toHaveText(String(count));
      }
    });

    test('selecting a tag filters the results to that tag', async () => {
      const { value, count } = FACETS.tags[0];

      await search.toggleFacetOption(/^tags$/i, value);

      // The facet count is a promise about the filtered total; hold the module to it.
      await expect(search.pagingInfo).toHaveText(`Showing 1 - ${count} out of ${count}`);
      await expect(search.results).toHaveCount(count);
    });

    test('records the selected tag in the URL', async () => {
      const { value } = FACETS.tags[0];
      await search.toggleFacetOption(/^tags$/i, value);

      await expect(async () => {
        const params = search.urlParams();
        expect(params.get('filters[0][field]')).toBe('jcr:tags');
        expect(params.get('filters[0][values][0]')).toBe(value);
        expect(params.get('filters[0][type]')).toBe('all');
      }).toPass();
    });

    test('deselecting a tag restores the full result set', async () => {
      const { value, count } = FACETS.tags[0];

      await search.toggleFacetOption(/^tags$/i, value);
      await expect(search.pagingInfo).toContainText(`out of ${count}`);

      await search.toggleFacetOption(/^tags$/i, value);
      await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
      await expect(async () => {
        expect(search.urlParams().get('filters[0][field]')).toBeNull();
      }).toPass();
    });

    test('reflects selection in the checkbox state', async () => {
      const { value } = FACETS.tags[0];
      const checkbox = search.facetOption(/^tags$/i, value).locator('input[type="checkbox"]');

      await expect(checkbox).not.toBeChecked();
      await search.toggleFacetOption(/^tags$/i, value);
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('last modified date-range facet', () => {
    test('offers the five configured ranges, in order, with translated labels', async () => {
      const options = search
        .facet(/last modified/i)
        .locator('.sui-multi-checkbox-facet__input-text');
      await expect(options).toHaveText([...FACETS.lastModifiedRanges]);
    });

    test('every range is empty, because Digitall content predates all of them', async () => {
      for (const range of FACETS.lastModifiedRanges) {
        await expect(search.facetOptionCount(/last modified/i, range)).toHaveText('0');
      }
    });

    test('selecting a range applies a real filter and empties the results', async () => {
      // Proves the date_range filter is genuinely applied rather than ignored: the ranges match
      // nothing, so choosing one must produce the empty state.
      await search.toggleFacetOption(/last modified/i, 'Last Week');

      await expect(search.app).toContainText(NO_RESULTS_MESSAGE);
      await expect(search.results).toHaveCount(0);
      await expect(async () => {
        expect(search.urlParams().get('filters[0][field]')).toBe('jcr:lastModified');
      }).toPass();
    });
  });

  test('combining a tag filter with a query narrows further', async () => {
    const { value, count } = FACETS.tags[0];
    await search.toggleFacetOption(/^tags$/i, value);
    await expect(search.pagingInfo).toContainText(`out of ${count}`);

    await search.search('digitall');
    // Both constraints apply, so the total can only shrink or stay equal — never grow.
    await expect(async () => {
      const total = Number((await search.pagingInfo.innerText()).match(/out of (\d+)/)![1]);
      expect(total).toBeLessThanOrEqual(count);
    }).toPass();
  });
});
