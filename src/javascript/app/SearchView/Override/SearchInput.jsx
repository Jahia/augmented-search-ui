import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';

const SearchInput = ({
    getAutocomplete,
    getButtonProps,
    getInputProps
}) => {
    const {t} = useTranslation();
    return (
        <>
            <div className="sui-search-box__wrapper">
                <input {...getInputProps()}/>
                {getAutocomplete()}
            </div>
            <input {...getButtonProps({value: t('search.ui.btn.search')})}/>
        </>
    );
};

SearchInput.propTypes = {
    getAutocomplete: PropTypes.func,
    getButtonProps: PropTypes.func,
    getInputProps: PropTypes.func
};

export default SearchInput;
