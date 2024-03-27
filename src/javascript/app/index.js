import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import i18n from './i18n/i18n';

const bootstrap = function (target, context) {
    i18n.changeLanguage(context.language);
    const root = ReactDOM.createRoot(document.getElementById(target));
    root.render(
        <App dxContext={context}/>
    );
};

window.augmentedSearchUIApp = bootstrap;
