import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const bootstrap = function (target, context) {
    ReactDOM.render(<App dxContext={context}/>, document.getElementById(target));
};

window.augmentedSearchUIApp = bootstrap;
