import moment from 'moment/moment';
import {BsDashLg} from 'react-icons/bs';
import PropTypes from 'prop-types';
import React from 'react';
import {getEscapedField} from '../utils';
export const DateComponent = ({result, t}) => {
    const lastModifiedBy = getEscapedField(result, 'lastModifiedBy');
    const lastModifiedDate = getEscapedField(result, 'lastModified');
    const createdBy = getEscapedField(result, 'createdBy');
    const createdDate = getEscapedField(result, 'created');

    const author = lastModifiedBy || createdBy;
    const date = lastModifiedDate || createdDate;

    if (author && date) {
        return (
            <>
                <span>
                    {moment(date).format('lll')}
                    {' '}
                    {lastModifiedDate &&
                        <small>{`(${t('result.createdAt')} ${moment(createdDate).format('ll')})`}</small>}
                </span>
                {' '}
                <BsDashLg/>
                {' '}
                <span>{author}</span>
                {' '}
                <BsDashLg/>
                {' '}
            </>

        );
    }

    return null;
};

DateComponent.propTypes = {
    result: PropTypes.object,
    t: PropTypes.func
};
