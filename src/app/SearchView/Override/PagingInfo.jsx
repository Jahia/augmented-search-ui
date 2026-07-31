import React from 'react';
import PropTypes from 'prop-types';
import {ViewHelpers} from '@elastic/react-search-ui-views';
import {useTranslation} from 'react-i18next';

const PagingInfo = ({
    className,
    end,
    searchTerm,
    start,
    totalResults,
    ...rest
}) => {
    const {t} = useTranslation();
    return (
        <div className={ViewHelpers.appendClassName('sui-paging-info', className)} {...rest}>
            {t('search.ui.showing') + ' '}
            <strong>
                {start} - {end}
            </strong>{' '}
            {t('search.ui.outOf')} <strong>{totalResults}</strong>
            {searchTerm ?
<>
    {' '}
    {t('search.ui.for')}: <em>{searchTerm}</em>
  </> :
null}
        </div>
    );
};

PagingInfo.propTypes = {
    className: PropTypes.bool,
    end: PropTypes.number,
    searchTerm: PropTypes.string,
    start: PropTypes.number,
    totalResults: PropTypes.number
};
export default PagingInfo;
