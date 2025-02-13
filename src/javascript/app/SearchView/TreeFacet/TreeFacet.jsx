import PropTypes from 'prop-types';
import React from 'react';

// Import {FacetValue} from '@elastic/search-ui/lib/esm/types';
import {appendClassName} from '@elastic/react-search-ui-views/lib/esm/view-helpers';
import Tree from './Tree/Tree';

const TreeFacet = ({
    className,
    label,
    onMoreClick,
    onSelect,
    onRemove,
    options,
    showMore,
    treeField
}) => {
    return (
        <fieldset className={appendClassName('sui-facet', className)}>
            <legend className="sui-facet__title">{label}</legend>
            <div className="sui-multi-checkbox-facet">
                {options.length < 1 && <div>No matching options</div>}
                <Tree options={options} field={treeField} onSelect={onSelect} onRemove={onRemove}/>
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
};

TreeFacet.propTypes = {
    label: PropTypes.string.isRequired,
    treeField: PropTypes.string.isRequired,
    onMoreClick: PropTypes.func.isRequired,
    // Options: PropTypes.arrayOf(FacetValue).isRequired,
    options: PropTypes.arrayOf(Object).isRequired,
    showMore: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default TreeFacet;
