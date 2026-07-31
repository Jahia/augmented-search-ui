/**
 * What the Digitall demo site is expected to contain.
 *
 * These are CHARACTERISATION values, captured from the module as it behaves today. They are exact on
 * purpose: this suite exists to detect behaviour changes during the migration to a Jahia JavaScript
 * module, and a fuzzy assertion detects nothing.
 *
 * They are stable because the environment pins everything: Digitall 3.0.0, augmented-search 4.1.0,
 * and `dev/provision.sh` waits for indexation to *settle* before the suite starts.
 *
 * If one of these fails after a content or version bump, the value is what needs updating — but
 * check first that the behaviour genuinely changed rather than reflexively editing the number.
 */

/** Live pages, one per site language. Digitall's default language is `en`. */
export const PAGES = {
  en: '/sites/digitall/home.html',
  fr: '/fr/sites/digitall/home.html',
  de: '/de/sites/digitall/home.html',
} as const;

export type Language = keyof typeof PAGES;

/** Total LIVE documents for an empty query — identical across the three languages. */
export const TOTAL_RESULTS = 61;

/** Search UI's default page size, and the options offered by the ResultsPerPage override. */
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = ['20', '40', '60'] as const;

/** Sort options, in the order SearchView declares them. */
export const SORT_OPTIONS = {
  created: { label: 'Creation date', field: 'jcr:created', direction: 'desc' },
  modified: { label: 'Updated date', field: 'jcr:lastModified', direction: 'desc' },
  relevance: { label: 'Relevance', field: '', direction: '' },
  title: { label: 'Title', field: 'jcr:title.keyword', direction: 'asc' },
} as const;

/** Facet values Digitall actually produces. */
export const FACETS = {
  /** The `jgql:categories_path` tree facet. "Annual Filings" is a leaf here — no children to expand. */
  categories: [{ value: 'Annual Filings', count: 8 }],
  /** `jcr:tags`, ordered by descending count as returned. */
  tags: [
    { value: 'health', count: 3 },
    { value: 'food', count: 2 },
    { value: 'movies', count: 2 },
  ],
  /**
   * The `jcr:lastModified` date_range facet. Every count is 0: Digitall's content was last modified
   * in 2016 and the ranges are relative to *now*, so nothing falls inside them. The options still
   * render and remain clickable, which is what makes them testable.
   */
  lastModifiedRanges: [
    'Last 5 years',
    'Last year',
    'Last 6 months',
    'Last month',
    'Last Week',
  ],
} as const;

/**
 * Facets that are configured but never rendered on Digitall, for opposite reasons:
 *  - `jcr:lastModifiedBy` ("Author") is a **conditionalFacet**: SearchView only requests it while a
 *    `jcr:lastModified` filter is active. Digitall content *is* authored (by `root`), so its absence
 *    proves the condition, not a lack of data.
 *  - `jcr:keywords` ("Keywords") simply has no values in Digitall, and Search UI renders nothing for
 *    a facet with no options.
 */
export const ABSENT_FACET_TITLES = ['AUTHOR', 'KEYWORDS'] as const;

/** A term with a known, stable number of hits. */
export const KNOWN_QUERY = { term: 'movies', hits: 20 } as const;

/** A term that matches nothing, for the empty-state path. */
export const NO_MATCH_QUERY = 'zzzzqqqqnothingmatchesthis';

/** UI strings per language. */
export const LABELS = {
  en: {
    placeholder: 'Search',
    submit: 'Search',
    sortBy: 'Sort by',
    show: 'Show',
    facetTitles: ['Categories', 'Tags', 'Last modified'],
    pagingInfoAll: `Showing 1 - ${DEFAULT_PAGE_SIZE} out of ${TOTAL_RESULTS}`,
    createdAt: 'created at',
  },
  fr: {
    placeholder: 'Rechercher',
    submit: 'Rechercher',
    sortBy: 'Ordonner par',
    show: 'Afficher',
    facetTitles: ['Catégories', 'Tags', 'Dernière modification'],
    pagingInfoAll: `Affiche 1 - ${DEFAULT_PAGE_SIZE} sur ${TOTAL_RESULTS}`,
    createdAt: 'créé le',
  },
  de: {
    placeholder: 'Suchen',
    submit: 'Suchen',
    sortBy: 'Sortieren nach',
    show: 'Zeigen',
    facetTitles: ['Kategorien', 'Tags', 'Zuletzt geändert'],
    pagingInfoAll: `Anzeigen 1 - ${DEFAULT_PAGE_SIZE} von ${TOTAL_RESULTS}`,
    createdAt: 'erstellt am',
  },
} as const;

/**
 * The empty-results message. Hardcoded in SearchView as `fallbackView="Nothing was found"` rather
 * than read from the `search.fallbackMsg` i18n key, so it is English in every language even though
 * translations exist. Another behaviour recorded as-is.
 */
export const NO_RESULTS_MESSAGE = 'Nothing was found';

/** A title that is first when sorting ascending by title, and one that is first by creation date. */
export const FIRST_BY_TITLE = 'Hegebottom';
export const FIRST_BY_CREATED = 'Search Results';
