import React from 'react';
import PropTypes from 'prop-types';
import {appendClassName} from '@elastic/react-search-ui-views/lib/esm/view-helpers';
import {useTranslation} from 'react-i18next';

function AsPagingInfo({
    className,
    end,
    searchTerm,
    start,
    totalResults,
    ...rest
}) {
    const {t} = useTranslation();
    return (
        <div className={appendClassName('sui-paging-info', className)} {...rest}>
            {t('search.ui.showing') + ' '}
            <strong>
                {start} - {end}
            </strong>{' '}
            {t('search.ui.outOf')} <strong>{totalResults}</strong>
            {searchTerm && (
                <>
                    {' '}
                    {t('search.ui.for')}: <em>{searchTerm}</em>
                </>
            )}
        </div>
    );
}

AsPagingInfo.propTypes = {
    className: PropTypes.bool,
    end: PropTypes.number,
    searchTerm: PropTypes.string,
    start: PropTypes.number,
    totalResults: PropTypes.number
};
export default AsPagingInfo;
