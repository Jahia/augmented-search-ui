import React from 'react';
import PropTypes from 'prop-types';
import '@elastic/react-search-ui-views/lib/styles/styles.css';
import JahiaSearchAPIConnector, {Field, FieldType} from '@jahia/search-ui-jahia-connector';
import {SearchProvider, WithSearch} from '@elastic/react-search-ui';
import SearchView from './SearchView';
import {useTranslation} from 'react-i18next';
import {JahiaCtxProvider} from './context';
import {ApolloProvider} from '@apollo/client';
import {getClient} from './waGraphQL';

let fields = [
    new Field(FieldType.HIT, 'link'),
    new Field(FieldType.HIT, 'displayableName', 'title'),
    new Field(FieldType.HIT, 'excerpt', null, true),
    new Field(FieldType.HIT, 'score'),
    new Field(FieldType.HIT, 'lastModified'),
    new Field(FieldType.HIT, 'lastModifiedBy'),
    new Field(FieldType.HIT, 'createdBy'),
    new Field(FieldType.HIT, 'created'),
    new Field(FieldType.HIT, 'nodeType'),
    new Field(FieldType.HIT, 'mimeType'),
    new Field(FieldType.REFERENCE_AS_VALUE, 'image')
];

function configureConnector(dxContext, t) {
    let connector = new JahiaSearchAPIConnector({
        apiToken: 'none',
        baseURL: dxContext.baseURL + dxContext.ctx,
        siteKey: dxContext.siteKey,
        language: dxContext.language,
        workspace: dxContext.workspace === 'default' ? 'EDIT' : 'LIVE'
    });
    return {
        searchQuery: {
            // eslint-disable-next-line camelcase
            result_fields: fields,
            facets: {
                'jgql:categories_path': {
                    type: 'value',
                    disjunctive: true,
                    max: 50,
                    hierarchical: true,
                    rootPath: ''
                },
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
                            name: t('facet.range.lastWeek')
                        },
                        {
                            from: 'now-1M',
                            to: 'now-1w',
                            name: t('facet.range.lastMonth')
                        },
                        {
                            from: 'now-6M',
                            to: 'now-1M',
                            name: t('facet.range.last6Months')
                        },
                        {
                            from: 'now-1y',
                            to: 'now-6M',
                            name: t('facet.range.lastYear')
                        },
                        {
                            from: 'now-5y',
                            to: 'now-1y',
                            name: t('facet.range.last5Years')
                        }
                    ]
                }
            },
            conditionalFacets: {
                'jcr:lastModifiedBy': filters => filters.filters.some(filter => filter.field === 'jcr:lastModified')
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
        hasA11yNotifications: true,
        alwaysSearchOnInitialLoad: true
    };
}

const App = ({dxContext}) => {
    const {t} = useTranslation();
    const client = getClient(dxContext.gqlServerUrl);
    return (
        <JahiaCtxProvider value={{
            language: dxContext.language,
            workspace: dxContext.workspace === 'default' ? 'EDIT' : 'LIVE'
        }}
        >
            <ApolloProvider client={client}>
                <SearchProvider config={configureConnector(dxContext, t)}>
                    <WithSearch mapContextToProps={({wasSearched, results, searchTerm}) => ({wasSearched, results, searchTerm})}>
                        {SearchView}
                    </WithSearch>
                </SearchProvider>
            </ApolloProvider>
        </JahiaCtxProvider>
    );
};

App.propTypes = {
    dxContext: PropTypes.object
};

export default App;

