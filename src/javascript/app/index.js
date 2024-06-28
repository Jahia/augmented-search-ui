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
const bootstrap = function (target, context) {
    i18n.changeLanguage(context.language);
    moment().locale(context.language);
    const root = createRoot(document.getElementById(target));
    const client = getClient(context.gqlServerUrl);

    // Note should do a try,catch to ensure that content of context.nodeTypesMap is a JSON format
    root.render(
        <JahiaCtxProvider value={{
            language: context.language,
            workspace: context.workspace === 'default' ? 'EDIT' : 'LIVE',
            nodeTypesMap: {...nodeTypesMap, ...context.nodeTypesMap.reduce((obj, map) => ({...obj, ...map}), {})}
        }}
        >
            <ApolloProvider client={client}>
                <App dxContext={context}/>
            </ApolloProvider>
        </JahiaCtxProvider>
    );
};

window.augmentedSearchUIApp = bootstrap;
