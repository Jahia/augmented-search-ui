import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import i18n from './i18n/i18n';
import moment from 'moment';
import 'moment/locale/fr';
import {JahiaCtxProvider} from './context';
import {ApolloClient, ApolloProvider, createHttpLink, InMemoryCache} from '@apollo/client';
// Import {getClient} from './waGraphQL';
const bootstrap = function (target, context) {
    i18n.changeLanguage(context.language);
    moment().locale(context.language);
    const root = createRoot(document.getElementById(target));
    // Const client = getClient(context.gqlServerUrl);
    const httpLink = createHttpLink({
        uri: '/modules/graphql'
    });

    // 3
    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache()
    });

    root.render(
        <JahiaCtxProvider value={{
            language: context.language,
            workspace: context.workspace === 'default' ? 'EDIT' : 'LIVE'
        }}
        >
            <ApolloProvider client={client}>
                <App dxContext={context}/>
            </ApolloProvider>
        </JahiaCtxProvider>
    );
};

window.augmentedSearchUIApp = bootstrap;
