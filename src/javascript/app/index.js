import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import i18n from './i18n/i18n';
import moment from 'moment';
import 'moment/locale/fr';
import {JahiaCtxProvider} from './context';
import {ApolloProvider/* , ApolloClient, createHttpLink, InMemoryCache */} from '@apollo/client';
import {getClient} from './waGraphQL';
import {nodeTypesMap} from './config';
import {Store} from './store/Store';
const bootstrap = function (target, context) {
    i18n.changeLanguage(context.language);
    moment().locale(context.language);
    const root = createRoot(document.getElementById(target));
    const client = getClient(context.gqlServerUrl);
    const searchLanguage = localStorage.getItem('searchLanguage') || context.language;

    context.webapp = context.webapp || {};

    root.render(
        <JahiaCtxProvider value={{
            language: context.language,
            workspace: context.workspace === 'default' ? 'EDIT' : 'LIVE',
            nodeTypesMap: {...nodeTypesMap, ...context.webapp.nodeTypesMap.reduce((obj, map) => ({...obj, ...map}), {})},
            resultsPerPage: context.webapp.resultsPerPage,
            resultsView: context.webapp.resultsView || 'Ggle',
            isFacetDisabled: context.webapp.isFacetDisabled,
            isPagingDisabled: context.webapp.isPagingDisabled,
            isSearchBoxDisabled: context.webapp.isSearchBoxDisabled,
            isProductEnabled: context.webapp.isProductEnabled
        }}
        >
            <ApolloProvider client={client}>
                <Store searchLanguage={searchLanguage} languages={context.languages} currentSiteLanguage={context.language}>
                    <App dxContext={context}/>
                </Store>
            </ApolloProvider>
        </JahiaCtxProvider>
    );
};

window.augmentedSearchUIApp = bootstrap;
