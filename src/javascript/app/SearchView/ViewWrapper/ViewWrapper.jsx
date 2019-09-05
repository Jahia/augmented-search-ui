import PropTypes from 'prop-types';

const ViewWrapper = ({wasSearched, results, view, fallbackView = ''}) => (
    wasSearched && results.length > 0 ? view : fallbackView
);

ViewWrapper.propTypes = {
    wasSearched: PropTypes.bool.isRequired,
    results: PropTypes.array.isRequired,
    view: PropTypes.oneOf(PropTypes.array, PropTypes.element, PropTypes.func, PropTypes.string),
    fallbackView: PropTypes.oneOf(PropTypes.array, PropTypes.element, PropTypes.func, PropTypes.string)
};

export default ViewWrapper;
