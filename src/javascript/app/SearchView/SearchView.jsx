import React from 'react';
import PropTypes from 'prop-types';
import {
    ErrorBoundary,
    Facet,
    Paging,
    PagingInfo,
    Result,
    ResultsPerPage,
    SearchBox,
    Sorting
} from '@elastic/react-search-ui/lib/esm/containers';
import {Layout} from '@elastic/react-search-ui-views/lib/esm/layouts';
import ViewWrapper from './ViewWrapper';
import {ResultView, ResultViewIllustrated} from './ResultView';
import TreeFacet from './TreeFacet/TreeFacet';
import {useTranslation} from 'react-i18next';
import SearchInputView from './Override/SearchInput';
import PagingInfoView from './Override/PagingInfo';
import ResultsPerPageView from './Override/ResultsPerPage';

const getSortOptions = t => [
    {
        name: t('facet.sortOptions.created'),
        value: 'jcr:created',
        direction: 'desc'
    },
    {
        name: t('facet.sortOptions.modified'),
        value: 'jcr:lastModified',
        direction: 'desc'
    },
    {
        name: t('facet.sortOptions.relevance'),
        value: '',
        direction: ''
    },
    {
        name: t('facet.sortOptions.title'),
        value: 'jcr:title.keyword',
        direction: 'asc'
    }
];

let typingTimer; // Timer identifier
const doneTypingInterval = 3000; // Time in ms (3 seconds)
const searchTermLength = 3; // Number of terms to type before to track

const buildAndFireSearchEvent = searchTerm => {
    if (!window.wem ||
        !window.wem.buildEvent ||
        !window.wem.buildTarget ||
        !window.wem.buildSourcePage ||
        !window.wem.collectEvent
    ) {
        console.warn('[buildAndFireSearchEvent] window.wem or buildEvent or buildTarget or buildSourcePage or collectEvent is missing');
        return;
    }

    const searchEvent = window.wem.buildEvent('search',
        window.wem.buildTarget('augmentedSearchForm', 'form'),
        window.wem.buildSourcePage()
    );

    searchEvent.properties = {
        originForm: 'augmentedSearchForm',
        language: window.digitalData?.page.pageInfo.language,
        keyword: searchTerm,
        origin: location.pathname
    };
    window.wem.collectEvent(searchEvent,
        () => console.debug('[buildAndFireSearchEvent] search formEvent sent'),
        () => console.debug('[buildAndFireSearchEvent] oups search formEvent was not handled properly')
    );
};

const SearchView = ({wasSearched, results, searchTerm}) => {
    const {t} = useTranslation();
    // If searchTerm is already populated
    React.useEffect(() => {
        // Console.debug('[useEffect] searchTerm : ', searchTerm);
        if (searchTerm && searchTerm.length >= searchTermLength) {
            buildAndFireSearchEvent(searchTerm);
        }
    }, [searchTerm]);

    const handleKeyup = () => {
        // Console.debug('[handleKeyup] searchTerm : ', searchTerm, ' || typingTimer : ', typingTimer);

        if (!window.wem) {
            console.warn('[handleKeyup] window.wem is missing');
            return;
        }

        clearTimeout(typingTimer);
        if (searchTerm && searchTerm.length >= searchTermLength) {
            typingTimer = setTimeout(() => buildAndFireSearchEvent(searchTerm), doneTypingInterval);
        }
    };

    return (
        <div>
            <ErrorBoundary>
                <Layout
                    header={
                        <SearchBox
                            searchAsYouType
                            inputProps={{
                                onKeyUp: handleKeyup,
                                placeholder: t('search.ui.inputPlaceholder')
                            }}
                            inputView={SearchInputView}
                            useAutocomplete={false}
                            AutocompleteResults={{
                                linkTarget: '_blank',
                                sectionTitle: 'Results',
                                titleField: 'title',
                                urlField: 'link',
                                shouldTrackClickThrough: true,
                                clickThroughTags: ['test']
                            }}
                            autocompleteSuggestions={false}
                            autocompleteMinimumCharacters={1}
                            debounceLength={0}
                        />
                    }
                    bodyContent={<ViewWrapper wasSearched={wasSearched}
                                              results={results}
                                              fallbackView="Nothing was found"
                                              view={results.map(result => {
                                                  const Cmp = result.image?.raw ? ResultViewIllustrated : ResultView;
                                                  return (
                                                      <Result key={result.id.raw}
                                                              id={result.id.raw}
                                                              view={Cmp}
                                                              result={result}
                                                              titleField="title"
                                                              urlField="link"
                                                      />
                                                  );
}
                                              )}/>}
                    bodyHeader={
                        <>
                            <ViewWrapper wasSearched={wasSearched}
                                         results={results}
                                         view={<PagingInfo view={PagingInfoView}/>}
                                         fallbackView=""/>
                            <ViewWrapper wasSearched={wasSearched}
                                         results={results}
                                         view={<ResultsPerPage view={ResultsPerPageView}/>}
                                         fallbackView=""/>
                        </>
                    }
                    bodyFooter={<ViewWrapper wasSearched={wasSearched} results={results} view={<Paging/>} fallbackView=""/>}
                    sideContent={
                        <>
                            <Sorting label={t('facet.sortBy')} sortOptions={getSortOptions(t)}/>
                            <Facet
                                field="jgql:categories_path"
                                label={t('facet.categories')}
                                view={TreeFacet}
                                show={50}
                                filterType="any"
                                treeField="jgql:categories_path"
                            />
                            <Facet
                                field="jcr:lastModifiedBy"
                                label={t('facet.lastModifiedBy')}
                            />
                            <Facet
                                field="jcr:tags"
                                label={t('facet.tags')}
                            />
                            <Facet
                                field="jcr:keywords"
                                label={t('facet.keywords')}
                            />
                            <Facet
                                field="jcr:lastModified"
                                label={t('facet.lastModified')}
                            />
                        </>
                    }
                />
            </ErrorBoundary>
        </div>
    );
};

SearchView.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array,
    searchTerm: PropTypes.string
};

export default SearchView;
