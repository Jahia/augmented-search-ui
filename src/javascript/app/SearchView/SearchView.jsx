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
                            field="industryCat_path"
                            label="Companies"
                            view={TreeFacet}
                            show={50}
                            filterType="any"
                            treeField="industryCat_path"
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

SearchView.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array
};

export default SearchView;
