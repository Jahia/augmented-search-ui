import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import {
  LABELS,
  NO_RESULTS_MESSAGE,
  NO_MATCH_QUERY,
  PAGES,
  TOTAL_RESULTS,
  type Language,
} from '../support/expected.js';

/**
 * Internationalisation, as it actually behaves.
 *
 * The JSP hands the app `language` (the content locale) and the app calls
 * `i18n.changeLanguage(context.language)`, so the UI chrome is supposed to follow the page language.
 *
 * ⚠ THREE KNOWN BUGS ARE PINNED HERE ON PURPOSE. They are current behaviour, and the point of this
 * suite is that the migration must not change behaviour silently — including broken behaviour. Each
 * is marked BUG below. When one is deliberately fixed, the corresponding assertion should be
 * inverted in the same commit, so the change is visible in review.
 */
test.describe('i18n', () => {
  for (const language of ['en', 'fr'] as Language[]) {
    test(`translates the UI chrome into ${language}`, async ({ page }) => {
      const search = new SearchPage(page);
      await search.goto(language);
      const labels = LABELS[language];

      await expect(search.input).toHaveAttribute('placeholder', labels.placeholder);
      await expect(search.submitButton).toHaveValue(labels.submit);
      await expect(search.sortLabel).toHaveText(new RegExp(`^${labels.sortBy}$`, 'i'));
      await expect(search.pageSizeLabel).toHaveText(labels.show);
      await expect(search.pagingInfo).toHaveText(labels.pagingInfoAll);
      await expect(search.facetTitles).toHaveText(
        labels.facetTitles.map((t) => new RegExp(`^${t}$`, 'i')),
      );
    });
  }

  test('BUG: the German page shows English chrome, because de.json is never registered', async ({
    page,
  }) => {
    // i18n/resources.js imports only en and fr. i18n/de.json exists and is complete ("Kategorien",
    // "Sortieren nach", "Zeigen", …) but is never added to the bundle, so i18next falls back to en
    // (fallbackLng: 'en'). Fixing it is a one-line change to resources.js.
    const search = new SearchPage(page);
    await search.goto('de');

    await expect(search.input).toHaveAttribute('placeholder', 'Search');
    await expect(search.sortLabel).toHaveText(/^Sort by$/i);
    await expect(search.pageSizeLabel).toHaveText('Show');
    await expect(search.facetTitles).toHaveText([/^Categories$/i, /^Tags$/i, /^Last modified$/i]);

    // Explicitly NOT the German strings that de.json already provides.
    await expect(search.sortLabel).not.toHaveText(/Sortieren nach/i);
    await expect(search.facetTitles.first()).not.toHaveText(/Kategorien/i);
  });

  test('search results follow the page language, even when the chrome does not', async ({
    page,
  }) => {
    // The content side is wired correctly: the connector passes the content locale, so German pages
    // return German documents. Only the UI chrome falls back.
    const search = new SearchPage(page);

    await search.goto('en');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
    const english = await search.resultTitles.allInnerTexts();

    await search.goto('de');
    await expect(search.pagingInfo).toContainText(`out of ${TOTAL_RESULTS}`);
    const german = await search.resultTitles.allInnerTexts();

    expect(german).not.toEqual(english);
    // Digitall's German home page article.
    expect(german.join(' | ')).toContain('Digitall wurde gegründet');
  });

  test('every language indexes the same number of documents', async ({ page }) => {
    const search = new SearchPage(page);
    for (const language of Object.keys(PAGES) as Language[]) {
      await search.goto(language);
      // Compare against the language's own phrasing — French reads "Affiche 1 - 20 sur 61", so
      // asserting the English "out of 61" would fail on a correctly translated page.
      await expect(search.pagingInfo).toHaveText(LABELS[language].pagingInfoAll);
    }
  });

  test('BUG: dates are always formatted in French, whatever the page language', async ({ page }) => {
    // app/index.js does `import 'moment/locale/fr'`, which registers the locale AND makes it moment's
    // global default. The intended correction, `moment().locale(context.language)`, sets the locale on
    // a throwaway instance instead of globally (that would be `moment.locale(...)`), so every date
    // renders with French month names regardless of language.
    const search = new SearchPage(page);
    await search.goto('en');

    const excerpt = search.results.first().locator('.excerpt');
    // French abbreviated months: janv. févr. mars avr. mai juin juil. août sept. oct. nov. déc.
    await expect(excerpt).toContainText(
      /\d{1,2}\s(janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.)\s\d{4}/,
    );
    // The surrounding label IS translated, which is what makes the mismatch visible: an English
    // "created at" next to a French date.
    await expect(excerpt).toContainText(LABELS.en.createdAt);
  });

  test('BUG: the empty-results message is never translated', async ({ page }) => {
    // SearchView passes a literal `fallbackView="Nothing was found"` instead of using the
    // `search.fallbackMsg` key, which exists in all three bundles ("Aucun résultat ne correspond à
    // votre recherche", "Es wurde nichts gefunden").
    const search = new SearchPage(page);
    await search.goto('fr');
    await search.search(NO_MATCH_QUERY);

    await expect(search.app).toContainText(NO_RESULTS_MESSAGE);
    await expect(search.app).not.toContainText('Aucun résultat');
  });
});
