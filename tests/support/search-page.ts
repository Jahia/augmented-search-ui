import { type Page, type Locator, expect } from '@playwright/test';
import { PAGES, type Language } from './expected.js';

/**
 * Page object for the augmented-search-ui component.
 *
 * All knowledge of the rendered DOM lives here, deliberately: the suite may be ported to Cypress
 * later, and the specs should then need no changes beyond the driver calls.
 *
 * Selector rules learned the hard way — keep them:
 *  - **Never select on `input[type="text"]`.** Elastic's SearchBox renders its field with no `type`
 *    attribute at all, so an attribute selector cannot match it. Use the textbox role.
 *  - **Never select on the tree facet's classes.** They are styled-components hashes
 *    (`sc-beySPh gNyMxS`) that change on every build. Use roles and text.
 *  - **Avoid `react-select-N-*` ids** (sort / results-per-page). They are ordinal and shift when the
 *    number of selects on the page changes. `classNamePrefix="sui-select"` gives stable class names.
 *  - **Avoid comma-separated CSS inside a chained locator.** Playwright splits it at the top level,
 *    so the second alternative escapes the container scope.
 */
export class SearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** The container the module mounts into; its id carries the content node's uuid. */
  get app(): Locator {
    return this.page.locator('[id^="augmentedSearchUIApp_"]');
  }

  get input(): Locator {
    return this.app.getByRole('textbox').first();
  }

  get submitButton(): Locator {
    return this.app.locator('input[type="submit"]');
  }

  get pagingInfo(): Locator {
    return this.app.locator('.sui-paging-info');
  }

  get results(): Locator {
    return this.app.locator('.result');
  }

  get resultTitles(): Locator {
    return this.app.locator('.result .title');
  }

  get sortLabel(): Locator {
    return this.app.locator('.sui-sorting__label');
  }

  get pageSizeLabel(): Locator {
    return this.app.locator('.sui-results-per-page__label');
  }

  get facetTitles(): Locator {
    return this.app.locator('.sui-facet__title');
  }

  get pagination(): Locator {
    return this.app.locator('.sui-paging');
  }

  /** Open a language's home page and wait until the React app has actually mounted. */
  async goto(language: Language = 'en', query?: string): Promise<void> {
    const url = query ? `${PAGES[language]}?${query}` : PAGES[language];
    await this.page.goto(url);
    await this.waitUntilMounted();
  }

  /**
   * The JSP renders `<div id=…>Loading...</div>` and the bundle replaces it, so the container exists
   * long before the app does. The search field is the first thing that proves React has mounted.
   */
  async waitUntilMounted(): Promise<void> {
    await expect(this.app).toBeAttached();
    await this.input.waitFor({ state: 'visible' });
  }

  /**
   * Type a query. The SearchBox uses `searchAsYouType` with `debounceLength={0}`, so filling the
   * field is enough — there is no need to submit.
   */
  async search(term: string): Promise<void> {
    await this.input.fill(term);
  }

  /** A facet block, located by its visible legend. Case-insensitive: CSS uppercases the legend. */
  facet(title: string | RegExp): Locator {
    return this.app
      .locator('fieldset.sui-facet')
      .filter({ has: this.page.locator('legend', { hasText: title }) });
  }

  /** A checkbox option inside a standard (non-tree) facet. */
  facetOption(facetTitle: string | RegExp, value: string): Locator {
    return this.facet(facetTitle)
      .locator('label.sui-multi-checkbox-facet__option-label')
      .filter({ has: this.page.getByText(value, { exact: true }) });
  }

  /** The count badge next to a checkbox facet option. */
  facetOptionCount(facetTitle: string | RegExp, value: string): Locator {
    return this.facetOption(facetTitle, value).locator('.sui-multi-checkbox-facet__option-count');
  }

  async toggleFacetOption(facetTitle: string | RegExp, value: string): Promise<void> {
    await this.facetOption(facetTitle, value).click();
  }

  /**
   * A node in the Categories tree facet. TreeNode renders the value in a `span[role="button"]`, with
   * the count in a sibling span — no classes worth relying on.
   */
  treeNode(value: string): Locator {
    return this.facet(/categories|catégories|kategorien/i)
      .getByRole('button')
      .filter({ hasText: value });
  }

  /** Choose an option in one of the react-select dropdowns (sort, results-per-page). */
  private async chooseInSelect(container: Locator, optionText: string): Promise<void> {
    await container.locator('.sui-select__control').click();
    // The menu portals to the page root, so it is NOT inside `container`.
    await this.page.locator('.sui-select__option').filter({ hasText: optionText }).first().click();
  }

  async sortBy(optionLabel: string): Promise<void> {
    await this.chooseInSelect(this.app.locator('.sui-sorting'), optionLabel);
  }

  async setPageSize(size: string): Promise<void> {
    await this.chooseInSelect(this.app.locator('.sui-results-per-page'), size);
  }

  /** The value currently shown by a react-select. */
  selectedValueOf(which: 'sorting' | 'results-per-page'): Locator {
    const root = which === 'sorting' ? '.sui-sorting' : '.sui-results-per-page';
    return this.app.locator(`${root} .sui-select__single-value`);
  }

  async gotoPage(n: number): Promise<void> {
    await this.app.locator(`li.rc-pagination-item-${n} a`).click();
  }

  get activePage(): Locator {
    return this.app.locator('li.rc-pagination-item-active');
  }

  /** Query-state parameters Search UI keeps in the URL. */
  urlParams(): URLSearchParams {
    return new URL(this.page.url()).searchParams;
  }
}
