import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import { KNOWN_QUERY, LABELS } from '../support/expected.js';

/**
 * The anatomy of a result card, as rendered by the custom ResultView.
 *
 * ResultView is one of the pieces most likely to drift during the migration, because it is entirely
 * bespoke: title, node-type label, a breadcrumb built from the URL, an icon chosen per node type, a
 * date/author line, and an HTML excerpt.
 */
test.describe('result cards', () => {
  let search: SearchPage;

  test.beforeEach(async ({ page }) => {
    search = new SearchPage(page);
    await search.goto('en');
  });

  test('each card links to the content it found', async () => {
    const first = search.results.first();
    await expect(first).toBeVisible();

    // The whole card is wrapped in a single anchor.
    const link = first.locator('a').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/sites\/digitall\/.+\.html$/);

    // The title is an h3 inside that anchor and must not be empty.
    await expect(first.locator('h3.title')).not.toBeEmpty();
  });

  test('shows a human-readable node-type label', async () => {
    // getNodeTypeKey maps the JCR node type through config/types.js to an i18n key, falling back to
    // DEFAULT -> "Content". Digitall's content is mostly jnt:news / jnt:page, none of which appear in
    // config/types.js, so "Content" is the expected label here.
    // allInnerTexts() takes an immediate snapshot — it is one of the few Locator methods with no
    // auto-waiting — so wait for the cards to mount first or it reads an empty DOM. Every other test
    // here happens to wait through an `expect(locator)` assertion.
    const labels = search.app.locator('.result .search-content > span');
    await expect(labels.first()).toBeVisible();

    const texts = await labels.allInnerTexts();
    expect(texts.length).toBeGreaterThan(0);
    expect(texts.every((l) => l.trim().length > 0)).toBe(true);
    expect(texts).toContain('Content');
  });

  test('renders a breadcrumb derived from the content path', async () => {
    // getURLStream turns /sites/digitall/home/about/....html into "sites > digitall > home > about".
    const cite = search.results.first().locator('cite');
    await expect(cite).toContainText('sites');
    await expect(cite).toContainText('>');
    await expect(cite).toContainText('digitall');
    // The .html suffix is stripped.
    await expect(cite).not.toContainText('.html');
  });

  test('shows the modification date, the created-at hint and the author', async () => {
    const excerpt = search.results.first().locator('.excerpt');
    await expect(excerpt).toBeVisible();

    // DateComponent renders "<modified> (created at <created>) — <author> —".
    await expect(excerpt).toContainText(LABELS.en.createdAt);
    await expect(excerpt.locator('small')).toContainText(LABELS.en.createdAt);
    // Digitall's demo content is authored by root.
    await expect(excerpt).toContainText('root');
  });

  test('renders the excerpt as HTML, with search terms highlighted', async () => {
    await search.search(KNOWN_QUERY.term);
    await expect(search.results.first()).toBeVisible();

    // Augmented Search wraps matches in <em> (the configured highlighter tags) and ResultView injects
    // the snippet with dangerouslySetInnerHTML, so the markup must survive as real elements.
    const highlighted = search.app.locator('.result .excerpt em');
    await expect(highlighted.first()).toBeVisible();
    // The highlighted text is the STEMMED match, not the term typed: searching "movies" highlights
    // "movie", because the index applies the English stemmer configured in augmented-search.
    await expect(highlighted.first()).toContainText(/movie/i);
  });

  test('gives every card an icon', async () => {
    // getIcon always returns a react-icons SVG, defaulting to a file icon for unmapped types.
    const cards = await search.results.count();
    await expect(search.app.locator('.result .header svg')).toHaveCount(cards);
  });

  test('colours the card by node type', async () => {
    // getNodeTypeColor falls back to var(--color-default) for types absent from config/types.js.
    const style = await search.results.first().locator('a').first().getAttribute('style');
    expect(style).toContain('color:');
    expect(style).toMatch(/var\(--color-/);
  });
});
