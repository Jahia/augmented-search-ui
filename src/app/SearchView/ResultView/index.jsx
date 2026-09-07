import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {
    BsBodyText,
    BsLayoutTextWindowReverse,
    BsFileEarmarkPdf,
    BsFileEarmarkText,
    BsFillQuestionDiamondFill, BsCalendar2Week, BsBank2, BsDashLg
} from 'react-icons/bs';
import './ResultView.css';
import {nodeTypes, mimeTypes, nodeTypesColor} from '../../config';
import {useTranslation} from 'react-i18next';
function getFieldType(result, field, type) {
    if (result[field]) {
        return result[field][type];
    }
}

function getRaw(result, field) {
    return getFieldType(result, field, 'raw');
}

function getSnippet(result, field) {
    return getFieldType(result, field, 'snippet');
}

function htmlEscape(str) {
    if (!_.isEmpty(str)) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    return '';
}

function getEscapedField(result, field) {
    // Fallback to raw values here, because non-string fields
    // will not have a snippet fallback. Raw values MUST be html escaped.
    const safeField =
        getSnippet(result, field) || htmlEscape(getRaw(result, field));
    return Array.isArray(safeField) ? safeField.join(', ') : safeField;
}

function getEscapedFields(result) {
    return Object.keys(result).reduce((acc, field) => ({...acc, [field]: getEscapedField(result, field)}), {});
}

// Dates are rendered with the platform's own Intl, which reproduces the module's previous moment
// `lll` (date + time) and `ll` (date) formats exactly, while covering every site language — a date
// library only knows the locales the bundle happens to import, and silently formats any other
// language with the wrong one.
const DATE_PARTS = {day: 'numeric', month: 'short', year: 'numeric'};
const TIME_PARTS = {hour: '2-digit', minute: '2-digit'};

const toDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value, language) => {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat(language, DATE_PARTS).format(date) : '';
};

const formatDateTime = (value, language) => {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    return `${new Intl.DateTimeFormat(language, DATE_PARTS).format(date)} ${new Intl.DateTimeFormat(language, TIME_PARTS).format(date)}`;
};

// Inner date component
const DateComponent = ({result, t, language}) => {
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
                    {formatDateTime(date, language)}
                    {' '}
                    {lastModifiedDate ? <small>{`(${t('result.createdAt')} ${formatDate(createdDate, language)})`}</small> : null}
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
    t: PropTypes.func,
    language: PropTypes.string
};

const getFileIcon = mimeType => {
    switch (mimeType) {
        case mimeTypes.PDF: return <BsFileEarmarkPdf/>;
        default: return <BsFileEarmarkText/>;
    }
};

const getIcon = (nodeType, mimeType) => {
    const nt = nodeTypes();
    switch (nodeType) {
        case nt.ARTICLE: return <BsBodyText/>;
        case nt.QUIZ: return <BsFillQuestionDiamondFill/>;
        case nt.PAGE: return <BsLayoutTextWindowReverse/>;
        case nt.TRAINING: return <BsBank2/>;
        case nt.EVENT: return <BsCalendar2Week/>;
        case nt.FILE: return getFileIcon(mimeType);
        default: return <BsFileEarmarkText/>;
    }
};

const getNodeTypeKey = (nodeType, mimeType, i18n) => {
    const nt = nodeTypes('J2S');
    const key = nt[nodeType] || 'DEFAULT';

    if (key === 'FILE' && i18n.exists(`config.mimeTypes.${mimeType}`)) {
        return `config.mimeTypes.${mimeType}`;
    }

    return `config.nodeTypes.${key}`;
};

const getURLStream = url => url.replace('.html', '').split('/').reduce((string, item, index) => {
    if (!item) {
        return string;
    }

    if (index === 1) {
        return item;
    }

    return `${string} > ${item} `;
}, '');

const getNodeTypeColor = nodeType => nodeTypesColor[nodeType] || 'var(--color-default)';

const ResultView = ({id, titleField, urlField, result}) => {
    const {t, i18n} = useTranslation();

    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const nodeType = getRaw(result, 'nodeType');
    const mimeType = getRaw(result, 'mimeType');

    return (
        <div key={id}
             className="result"
        >
            <a href={url || '#'} style={{color: getNodeTypeColor(nodeType)}}>
                <br/>
                <h3 className="title">{title}</h3>
                <div className="header">
                    <span>
                        <div>
                            {getIcon(nodeType, mimeType)}
                        </div>
                    </span>
                    <div className="search-content">
                        <span>{t(getNodeTypeKey(nodeType, mimeType, i18n))}</span>
                        <div className="element">
                            <cite>
                                {/* {window.location.origin} */}
                                <span>{getURLStream(url)}</span>
                            </cite>
                        </div>
                    </div>
                </div>
                <div className="excerpt">
                    <DateComponent {...{result, t, language: i18n.language}}/>
                    <span dangerouslySetInnerHTML={{__html: fields.excerpt}}/>
                </div>
            </a>
        </div>
    );
};

ResultView.propTypes = {
    id: PropTypes.string,
    titleField: PropTypes.string,
    urlField: PropTypes.string,
    result: PropTypes.object
};

export default ResultView;
