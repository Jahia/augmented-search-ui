import React from 'react';
import PropTypes from 'prop-types';
import {
    ErrorBoundary,
    Paging,
    PagingInfo,
    Result,
    ResultsPerPage,
    SearchBox,
    Sorting,
    Facet
} from '@elastic/react-search-ui/es/containers';
import {Layout} from '@elastic/react-search-ui-views/es/layouts';
import ViewWrapper from './ViewWrapper';
import ResultView from './ResultView';

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
                    <div>
                        <ViewWrapper wasSearched={wasSearched}
                                     results={results}
                                     fallbackView=""
                                     view={
                                         <div>
                                             <Sorting label="Sort by" sortOptions={SORT_OPTIONS}/>
                                             <Facet
                                                 field="jfs:tags"
                                                 label="Tags"
                                             />
                                             <Facet
                                                 field="jfs:keywords"
                                                 label="Keywords"
                                             />
                                             <Facet
                                                 field="jfs:lastModified"
                                                 label="Last modified"
                                             />
                                             {/* Example of Number range facet */}
                                             {/* <Facet */}
                                             {/*    field="jfs:nodes.docRating" */}
                                             {/*    label="Document rating" */}
                                             {/* /> */}
                                         </div>
                                     }/>
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
