import React from 'react';
import PropTypes from 'prop-types';
import {
    ErrorBoundary,
    Facet,
    Paging,
    PagingInfo,
    ResultsPerPage,
    SearchBox,
    Sorting
} from '@elastic/react-search-ui/lib/esm/containers';
import {Layout} from '@elastic/react-search-ui-views/lib/esm/layouts';
import ViewWrapper from './ViewWrapper';
import TreeFacet from './TreeFacet/TreeFacet';
import {useTranslation} from 'react-i18next';
import SearchInputView from './Override/SearchInput';
import PagingInfoView from './Override/PagingInfo';
import ResultsPerPageView from './Override/ResultsPerPage';
import {JahiaCtx} from '../context';
import * as ResultView from './ResultView';
import clsx from 'clsx';
import './SearchView.css';
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
    const {resultsPerPage, resultsView, isFacetDisabled, isPagingDisabled, isSearchBoxDisabled} = React.useContext(JahiaCtx);
    const ResultViewCmp = ResultView[resultsView];
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

    const getResultPerPage = () => {
        if (resultsPerPage) {
            return <ResultsPerPage view={ResultsPerPageView} options={resultsPerPage}/>;
        }

        return <ResultsPerPage view={ResultsPerPageView}/>;
    };

    return (
        <div>
            <ErrorBoundary>
                <Layout
                    className={clsx({'sidebar-hidden': isFacetDisabled})}
                    header={!isSearchBoxDisabled &&
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
                        />}
                    bodyContent={<ResultViewCmp wasSearched={wasSearched}
                                                results={results}
                                             />}
                    bodyHeader={!isPagingDisabled &&
                        <>
                            <ViewWrapper wasSearched={wasSearched}
                                         results={results}
                                         view={<PagingInfo view={PagingInfoView}/>}
                                         fallbackView=""/>
                            <ViewWrapper wasSearched={wasSearched}
                                         results={results}
                                         view={getResultPerPage()}
                                         fallbackView=""/>
                        </>}
                    bodyFooter={!isPagingDisabled && <ViewWrapper wasSearched={wasSearched} results={results} view={<Paging/>} fallbackView=""/>}
                    sideContent={!isFacetDisabled &&
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
                        </>}
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
