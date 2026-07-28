import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import { FACETS, TOTAL_RESULTS } from '../support/expected.js';

/**
 * The Categories facet — the module's most bespoke component.
 *
 * TreeFacet/Tree/TreeNode replace Search UI's checkbox view with a hierarchical tree over
 * `jgql:categories_path`, driving its own GraphQL query to lazy-load children on expand. It is the
 * piece most at risk in the migration, and the least like anything Search UI provides.
 *
 * Note on selectors: TreeNode is built with styled-components, so its classes are build-specific
 * hashes. Everything here goes through roles and text instead (see SearchPage.treeNode).
 */
test.describe('categories tree facet', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
  });

  test('renders inside a labelled fieldset, not the checkbox view', async () => {
    const categories = search.facet(/^categories$/i);
    await expect(categories).toBeVisible();
    await expect(categories.locator('legend.sui-facet__title')).toHaveText(/^categories$/i);

    // TreeFacet reuses Search UI's container class but renders tree nodes rather than checkboxes.
    await expect(categories.locator('.sui-multi-checkbox-facet')).toBeVisible();
    await expect(categories.locator('input[type="checkbox"]')).toHaveCount(0);
  });

  test('lists each category with its document count', async () => {
    const { value, count } = FACETS.categories[0];
    const node = search.treeNode(value);

    await expect(node).toBeVisible();
    // TreeNode puts the count in a sibling span within the same row.
    await expect(search.facet(/^categories$/i)).toContainText(String(count));
  });

  test('selecting a category filters the results', async () => {
    const { value, count } = FACETS.categories[0];

    await search.treeNode(value).click();

    await expect(search.pagingInfo).toHaveText(`Showing 1 - ${count} out of ${count}`);
    await expect(search.results).toHaveCount(count);
  });

  test('records the category filter in the URL as a categories_path filter', async () => {
    const { value } = FACETS.categories[0];
    await search.treeNode(value).click();

    await expect(async () => {
      const params = search.urlParams();
      expect(params.get('filters[0][field]')).toBe('jgql:categories_path');
      // The tree filters on the category's PATH, not its display name, so assert a non-empty value
      // rather than the label.
      expect(params.get('filters[0][values][0]')).toBeTruthy();
      // SearchView configures this facet with filterType="any".
      expect(params.get('filters[0][type]')).toBe('any');
    }).toPass();
  });

  test('clicking a selected category deselects it and restores the results', async () => {
    const { value, count } = FACETS.categories[0];

    await search.treeNode(value).click();
    await expect(search.pagingInfo).toContainText(`out of ${count}`);

    // TreeNode toggles: onRemove when already selected. This is hand-rolled state, not Search UI's.
    await search.treeNode(value).click();
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
    await expect(async () => {
      expect(search.urlParams().get('filters[0][field]')).toBeNull();
    }).toPass();
  });

  test('marks the selected category with an underline', async () => {
    // Selection state is conveyed ONLY through `text-decoration: underline` on the title span — there
    // is no class, no aria-pressed, no checkbox. Worth pinning: it is both the sole visual signal and
    // an accessibility gap the migration could improve.
    const { value } = FACETS.categories[0];
    const node = search.treeNode(value);

    await expect(node).toHaveCSS('text-decoration-line', 'none');
    await node.click();
    await expect(node).toHaveCSS('text-decoration-line', 'underline');
  });

  test('shows no expand control for a leaf category', async () => {
    // "Annual Filings" has no descendants in Digitall, so TreeNode renders an empty icon slot and no
    // chevron. If a future dataset adds children, this test is the signal to add an expansion test.
    const categories = search.facet(/^categories$/i);
    await expect(categories.locator('svg')).toHaveCount(0);
  });

  test('does not offer the "+ More" button below the configured limit', async () => {
    // The facet is configured with show={50}; Digitall has a single category, so Search UI reports
    // showMore=false and TreeFacet renders no button.
    await expect(search.facet(/^categories$/i).locator('button.sui-facet-view-more')).toHaveCount(0);
  });

  test('disappears when a filter leaves no categories to offer', async () => {
    // Selecting a tag reduces the set to documents with no category, so the facet has no options and
    // Search UI drops it entirely. Recorded because it looks like a bug when first observed.
    await search.toggleFacetOption(/^tags$/i, 'health');
    await expect(search.pagingInfo).toContainText('out of 3');
    await expect(search.facet(/^categories$/i)).toHaveCount(0);
  });
});
