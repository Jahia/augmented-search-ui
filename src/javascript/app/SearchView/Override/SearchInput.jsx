import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {StoreCtx} from '../../context';
import './SearchInput.css';
const SearchInput = ({
    getAutocomplete,
    getButtonProps,
    getInputProps
}) => {
    const {t} = useTranslation();
    const {state: {languages, searchLanguage}, dispatch} = React.useContext(StoreCtx);
    const handleChange = event => dispatch(
        {
            case: 'UPDATE_SEARCH_LANGUAGE',
            payload: {
                searchLanguage: event.target.value
            }
        }
    );
    return (
        <>
            <div className="sui-search-box__wrapper">
                <input {...getInputProps()}/>
                {getAutocomplete()}
            </div>
            <select className="search-language-selector" value={searchLanguage} onChange={handleChange}>
                {languages?.map(language => <option key={language} value={language}>{language}</option>)}
            </select>
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
