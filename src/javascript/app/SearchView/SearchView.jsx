import React from 'react';
import PropTypes from 'prop-types';
import {
    ErrorBoundary,
    Paging,
    PagingInfo,
    Result,
    ResultsPerPage,
    SearchBox
} from '@elastic/react-search-ui/es/containers';
import {Layout} from '@elastic/react-search-ui-views/es/layouts';

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
            />
        </ErrorBoundary>
    </div>
);

SearchView.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array
};

export default SearchView;
