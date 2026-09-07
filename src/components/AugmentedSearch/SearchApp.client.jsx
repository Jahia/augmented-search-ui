import PropTypes from 'prop-types';
import App from '../../app/App';

/**
 * Client-side entry point: the island loader creates the React root and renders this.
 *
 * No i18next setup on purpose — the engine owns the instance and loads settings/locales/<lang>.json
 * for the page language, so useTranslation() works anywhere in the tree without a provider.
 */
const SearchApp = ({dxContext}) => {
    const context = {
        ...dxContext,
        baseURL: window.location.protocol + '//' + window.location.host
    };

    return <App dxContext={context}/>;
};

SearchApp.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default SearchApp;
