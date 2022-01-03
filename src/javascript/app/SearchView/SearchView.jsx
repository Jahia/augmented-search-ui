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
} from '@elastic/react-search-ui/es/containers';
import {Layout} from '@elastic/react-search-ui-views/es/layouts';
import ViewWrapper from './ViewWrapper';
import ResultView from './ResultView';
import TreeFacet from './TreeFacet/TreeFacet';

const SORT_OPTIONS = [
    {
        name: 'Created',
        value: 'jcr:created',
        direction: 'desc'
    },
    {
        name: 'Modified',
        value: 'jcr:lastModified',
        direction: 'desc'
    },
    {
        name: 'Relevance',
        value: '',
        direction: ''
    },
    {
        name: 'Title',
        value: 'jcr:title.keyword',
        direction: 'asc'
    }
];

let typingTimer; // Timer identifier
const doneTypingInterval = 3000; // Time in ms (3 seconds)
const searchTermLength = 3; // Number of terms before to track

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
        language: window.contextJsParameters.lang,
        keyword: searchTerm,
        origin: location.pathname
    };
    window.wem.collectEvent(searchEvent,
        () => console.debug('[buildAndFireSearchEvent] search formEvent sent'),
        () => console.debug('[buildAndFireSearchEvent] oups search formEvent was not handled properly')
    );
};

const SearchView = ({wasSearched, results, searchTerm}) => {
    // If searchTerm is already populated
    React.useEffect(() => {
        // Console.debug('[useEffect] searchTerm : ', searchTerm);
        if (searchTerm && searchTerm.length >= searchTermLength) {
            buildAndFireSearchEvent(searchTerm);
        }
    }, []);

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
                                onKeyUp: handleKeyup
                            }}
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
                                              view={results.map(result => (
                                                  <Result key={result.id.raw}
                                                          view={ResultView}
                                                          result={result}
                                                          titleField="title"
                                                          urlField="link"
                                                  />
                                              ))}/>}
                    bodyHeader={
                        <>
                            {<ViewWrapper wasSearched={wasSearched}
                                          results={results}
                                          view={<PagingInfo/>}
                                          fallbackView=""/>}
                            {<ViewWrapper wasSearched={wasSearched}
                                          results={results}
                                          view={<ResultsPerPage/>}
                                          fallbackView=""/>}
                        </>
                    }
                    bodyFooter={<ViewWrapper wasSearched={wasSearched} results={results} view={<Paging/>} fallbackView=""/>}
                    sideContent={
                        <>
                            <Sorting label="Sort by" sortOptions={SORT_OPTIONS}/>
                            <Facet
                                field="jgql:categories_path"
                                label="Categories"
                                view={TreeFacet}
                                show={50}
                                filterType="any"
                                treeField="jgql:categories_path"
                            />
                            <Facet
                                field="jcr:lastModifiedBy"
                                label="Author"
                            />
                            <Facet
                                field="jcr:tags"
                                label="Tags"
                            />
                            <Facet
                                field="jcr:keywords"
                                label="Keywords"
                            />
                            <Facet
                                field="jcr:lastModified"
                                label="Last modified"
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
