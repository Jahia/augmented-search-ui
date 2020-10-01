import PropTypes from 'prop-types';
import React from 'react';

import {FacetValue} from '@elastic/react-search-ui/es/types';
import {appendClassName} from '@elastic/react-search-ui-views/es/view-helpers';
import {Tree} from './Tree/Tree';

function TreeFacet({
    className,
    label,
    onMoreClick,
    onSelect,
    options,
    showMore
}) {
    return (
        <fieldset className={appendClassName('sui-facet', className)}>
            <legend className="sui-facet__title">{label}</legend>
            <div className="sui-multi-checkbox-facet">
                {options.length < 1 && <div>No matching options</div>}
                <Tree options={options} onSelect={onSelect}/>
            </div>

            {showMore && (
                <button
                    type="button"
                    className="sui-facet-view-more"
                    aria-label="Show more options"
                    onClick={onMoreClick}
                >
                    + More
                </button>
            )}
        </fieldset>
    );
}

TreeFacet.propTypes = {
    label: PropTypes.string.isRequired,
    onMoreClick: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(FacetValue).isRequired,
    showMore: PropTypes.bool.isRequired,
    className: PropTypes.string
};

export default TreeFacet;
