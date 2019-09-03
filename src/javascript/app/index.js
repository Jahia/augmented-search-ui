import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const bootstrap = function (target) {
    ReactDOM.render(<App/>, document.getElementById(target));
};

window.searchUIAcademyApp = bootstrap;
