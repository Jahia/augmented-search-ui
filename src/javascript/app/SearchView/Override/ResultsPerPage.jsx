import React from 'react';
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import {appendClassName} from '@elastic/react-search-ui-views/lib/esm/view-helpers';
import {useTranslation} from 'react-i18next';

const setDefaultStyle = {
    option: () => ({}),
    control: () => ({}),
    dropdownIndicator: () => ({}),
    indicatorSeparator: () => ({}),
    singleValue: provided => {
        // Pulling out CSS that we don't want
        // ***eslint-disable-next-line @typescript-eslint/no-unused-vars***
        const {position, top, transform, maxWidth, ...rest} = provided;
        return {...rest, lineHeight: 1, marginRight: 0};
    },
    valueContainer: provided => ({...provided, paddingRight: 0})
};

const wrapOption = option => ({label: option, value: option});

function Option(props) {
    return <components.Option {...props}>{props.data.label}</components.Option>;
}

Option.propTypes = {
    data: PropTypes.object
};

function AsResultsPerPage({
    className,
    onChange,
    options,
    value: selectedValue,
    ...rest
}) {
    const {t} = useTranslation();

    let selectedOption = null;

    if (selectedValue) {
        selectedOption = wrapOption(selectedValue);

        if (!options.includes(selectedValue)) {
            options = [selectedValue, ...options];
        }
    }

    return (
        <div
            className={appendClassName('sui-results-per-page', className)}
            {...rest}
        >
            <div className="sui-results-per-page__label">{t('search.ui.show')}</div>
            <Select
                className="sui-select sui-select--inline"
                classNamePrefix="sui-select"
                value={selectedOption}
                options={options.map(wrapOption)}
                isSearchable={false}
                styles={setDefaultStyle}
                components={{
                    Option: props => {
                        props.innerProps['data-transaction-name'] = 'results per page';
                        return Option(props);
                    }
                }}
                onChange={o => onChange(o.value)}
            />
        </div>
    );
}

AsResultsPerPage.propTypes = {
    className: PropTypes.bool,
    onChange: PropTypes.func,
    options: PropTypes.array,
    value: PropTypes.number
};

export default AsResultsPerPage;
