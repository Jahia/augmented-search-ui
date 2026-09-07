import { test, expect } from '@playwright/test';
import { SearchPage } from '../support/search-page.js';
import {
  GERMAN_ONLY_QUERY,
  LABELS,
  NO_RESULTS_MESSAGE,
  NO_MATCH_QUERY,
  PAGES,
  type Language,
} from '../support/expected.js';

/**
 * Internationalisation, as it actually behaves.
 *
 * The bundles live in `settings/locales/<lang>.json` and the JavaScript-modules engine loads them for
 * the page language, server-side and in the island alike — no provider, no `changeLanguage` call.
 *
 * ⚠ ONE KNOWN BUG IS PINNED HERE ON PURPOSE, marked BUG below: a refactor must not change behaviour
 * silently, including broken behaviour. When it is deliberately fixed, invert the assertion in the
 * same commit so the change is visible in review.
 */
test.describe('i18n', () => {
  for (const language of ['en', 'fr', 'de'] as Language[]) {
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

  // `de` was pinned as its own BUG test (English chrome) until the bundles moved to settings/locales/.

  test('search results follow the page language', async ({ page }) => {
    // The connector passes the content locale, so German pages return German documents.
    const search = new SearchPage(page);

    await search.goto('en');
    await expect(search.pagingInfo).toHaveText(LABELS.en.pagingInfoAll);
    const english = await search.resultTitles.allInnerTexts();

    await search.goto('de');
    // The German phrasing: asserting the English "out of 61" here only passed while the chrome fell
    // back to English.
    await expect(search.pagingInfo).toHaveText(LABELS.de.pagingInfoAll);
    const german = await search.resultTitles.allInnerTexts();

    expect(german).not.toEqual(english);

    // Then a real query, which scores its hits and so has a deterministic order. Asserting a specific
    // article is on page 1 of the EMPTY query does not work: all 61 results tie on relevance, so which
    // 20 appear is arbitrary per index build.
    await search.search(GERMAN_ONLY_QUERY.term);
    await expect(search.resultTitles.first()).toContainText(GERMAN_ONLY_QUERY.firstTitle);
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

  // Was "BUG: dates are always formatted in French": the old bootstrap called `moment().locale(lang)`,
  // setting the locale on a throwaway instance, so `import 'moment/locale/fr'` stayed moment's global
  // default. ResultView now formats with Intl from `i18n.language`.
  test('dates are formatted in the page language', async ({ page }) => {
    const search = new SearchPage(page);

    await search.goto('en');
    const english = search.results.first().locator('.excerpt');
    // English abbreviated months, e.g. "May 3, 2016 11:22 PM".
    await expect(english).toContainText(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s\d{1,2},\s\d{4}/,
    );
    await expect(english).toContainText(LABELS.en.createdAt);
    // French abbreviated months: janv. févr. mars avr. mai juin juil. août sept. oct. nov. déc.
    await expect(english).not.toContainText(
      /\d{1,2}\s(janv\.|févr\.|avr\.|juil\.|août|sept\.|déc\.)\s\d{4}/,
    );

    await search.goto('fr');
    const french = search.results.first().locator('.excerpt');
    await expect(french).toContainText(
      /\d{1,2}\s(janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.)\s\d{4}/,
    );
    await expect(french).toContainText(LABELS.fr.createdAt);
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
