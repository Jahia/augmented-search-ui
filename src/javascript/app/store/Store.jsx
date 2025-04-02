import React from 'react';
import {StoreCtxProvider} from '../context';

import PropTypes from 'prop-types';

const init = ({searchLanguage, languages, currentSiteLanguage}) => {
    return {
        searchLanguage,
        languages,
        currentSiteLanguage
    };
};

const reducer = (state, action) => {
    const {payload} = action;

    switch (action.case) {
        case 'UPDATE_SEARCH_LANGUAGE': {
            const {searchLanguage} = payload;
            // LocalStorage.setItem(storageKey, JSON.stringify(userConsentPreference));
            localStorage.setItem('searchLanguage', searchLanguage);
            return {
                ...state,
                searchLanguage
            };
        }

        default:
            throw new Error(`[STORE] action case '${action.case}' is unknown `);
    }
};

export const Store = ({searchLanguage, languages, currentSiteLanguage, children}) => {
    const [state, dispatch] = React.useReducer(
        reducer,
        {searchLanguage, languages, currentSiteLanguage},
        init
    );
    return (
        <StoreCtxProvider value={{state, dispatch}}>
            {children}
        </StoreCtxProvider>
    );
};

Store.propTypes = {
    searchLanguage: PropTypes.string,
    languages: PropTypes.string,
    currentSiteLanguage: PropTypes.string,
    children: PropTypes.node
};
