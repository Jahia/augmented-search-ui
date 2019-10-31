import React from 'react';
import PropTypes from 'prop-types';
import '@elastic/react-search-ui-views/lib/styles/styles.css';
import JahiaSearchAPIConnector, {Field, FieldType} from '@jahia/search-ui-jahia-connector';
import {SearchProvider, WithSearch} from '@elastic/react-search-ui';
import SearchView from './SearchView';

let fields = [
    new Field(FieldType.HIT, 'link'),
    new Field(FieldType.HIT, 'displayableName', 'title'),
    new Field(FieldType.HIT, 'excerpt', null, true),
    new Field(FieldType.HIT, 'score'),
    new Field(FieldType.HIT, 'lastModified'),
    new Field(FieldType.HIT, 'lastModifiedBy'),
    new Field(FieldType.HIT, 'createdBy'),
    new Field(FieldType.HIT, 'created')
];

function configureConnector(dxContext) {
    let connector = new JahiaSearchAPIConnector({
        apiToken: 'none',
        baseURL: dxContext.baseURL + dxContext.ctx,
        siteKey: dxContext.siteKey,
        language: dxContext.language,
        workspace: dxContext.workspace === 'default' ? 'EDIT' : 'LIVE',
        nodeType: 'jnt:page'
    });
    return {
        searchQuery: {
            // eslint-disable-next-line camelcase
            result_fields: fields,
            facets: {
                // Term Facet
                'jcr:lastModifiedBy': {
                    type: 'value',
                    disjunctive: true
                }, // Term Facet
                'jcr:tags': {
                    type: 'value',
                    disjunctive: true
                },
                // Term Facet
                'jcr:keywords': {
                    type: 'value',
                    disjunctive: true
                },
                // Date Range Facet
                'jcr:lastModified': {
                    type: 'date_range',
                    disjunctive: false,
                    ranges: [
                        {
                            from: 'now-1w',
                            to: 'now',
                            name: 'Last Week'
                        },
                        {
                            from: 'now-1M',
                            to: 'now-1w',
                            name: 'Last month'
                        },
                        {
                            from: 'now-6M',
                            to: 'now-1M',
                            name: 'Last 6 months'
                        },
                        {
                            from: 'now-1y',
                            to: 'now-6M',
                            name: 'Last year'
                        },
                        {
                            from: 'now-5y',
                            to: 'now-1y',
                            name: 'Last 5 years'
                        }
                    ]
                }
                // Example for Number Range Facet, note that nested docs no longer work
                // ,
                // 'jfs:nodes.docRating': {
                //     type: 'range',
                //     disjunctive: true,
                //     ranges: [
                //         {
                //             from: '0',
                //             to: '5.0',
                //             name: '0 - 5'
                //         },
                //         {
                //             from: '5.0',
                //             to: '10.0',
                //             name: '5 - 10'
                //         },
                //         {
                //             from: '10.0',
                //             to: '15.0',
                //             name: '10 - 15'
                //         },
                //         {
                //             from: '15.0',
                //             to: '20.0',
                //             name: '15 - 20'
                //         }
                //     ]
                // }
            }
        },
        autocompleteQuery: {
            results: {
                resultsPerPage: 10,
                // eslint-disable-next-line camelcase
                result_fields: fields
            }
        },
        apiConnector: connector,
        hasA11yNotifications: true
    };
}

const App = ({dxContext}) => {
    return (
        <SearchProvider config={configureConnector(dxContext)}>
            <WithSearch mapContextToProps={({wasSearched, results}) => ({wasSearched, results})}>
                {SearchView}
            </WithSearch>
        </SearchProvider>
    );
};

App.propTypes = {
    dxContext: PropTypes.object
};

export default App;

