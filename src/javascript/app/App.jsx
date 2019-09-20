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
    new Field(FieldType.NODE, 'jcr:created', 'created')
];

function configureConnector(dxContext) {
    let connector = new JahiaSearchAPIConnector({
        apiToken: 'none',
        baseURL: dxContext.baseURL + dxContext.ctx,
        siteKey: dxContext.siteKey,
        language: dxContext.language,
        workspace: 'LIVE',
        nodeType: 'jnt:page'
    });
    return {
        searchQuery: {
            // eslint-disable-next-line camelcase
            result_fields: fields,
            facets: {
                'jfs:tags': {
                    type: 'value',
                    disjunctive: true
                },
                'jfs:keywords': {
                    type: 'value',
                    disjunctive: true
                }
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

