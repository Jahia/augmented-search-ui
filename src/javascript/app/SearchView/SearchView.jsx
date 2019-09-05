import React from 'react';
import PropTypes from 'prop-types';
import {
    ErrorBoundary,
    Paging,
    PagingInfo,
    Result,
    ResultsPerPage,
    SearchBox,
    Sorting
} from '@elastic/react-search-ui/es/containers';
import {Layout} from '@elastic/react-search-ui-views/es/layouts';

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
        value: 'jcr:title',
        direction: 'asc'
    }
];

const SearchView = ({wasSearched, results}) => (
    <div>
        <ErrorBoundary>
            <Layout
                header={
                    <SearchBox
                        searchAsYouType
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
                bodyContent={results.map(result => (
                    <Result key={result.id.raw}
                            result={result}
                            titleField="title"
                            urlField="link"
                    />
                ))}
                bodyHeader={
                    <>
                        {wasSearched && <PagingInfo/>}
                        {wasSearched && <ResultsPerPage/>}
                    </>
                }
                bodyFooter={<Paging/>}
                sideContent={
                    <div>
                        {wasSearched && (
                            <Sorting label="Sort by" sortOptions={SORT_OPTIONS}/>
                        )}
                    </div>}
            />
        </ErrorBoundary>
    </div>
);

SearchView.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array
};

export default SearchView;
