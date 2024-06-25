import React from 'react';
import {mimeTypes, nodeTypes, nodeTypesColor} from '../../config';
import {
    BsBank2,
    BsBodyText, BsCalendar2Week,
    BsFileEarmarkPdf,
    BsFileEarmarkText,
    BsFillQuestionDiamondFill,
    BsLayoutTextWindowReverse
} from 'react-icons/bs';
import * as _ from 'lodash';

export const getFieldType = (result, field, type) => {
    if (result[field]) {
        return result[field][type];
    }
};

export const getRaw = (result, field) => {
    return getFieldType(result, field, 'raw');
};

export const getSnippet = (result, field) => {
    return getFieldType(result, field, 'snippet');
};

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

export const getEscapedField = (result, field) => {
    // Fallback to raw values here, because non-string fields
    // will not have a snippet fallback. Raw values MUST be html escaped.
    const safeField =
        getSnippet(result, field) || htmlEscape(getRaw(result, field));
    return Array.isArray(safeField) ? safeField.join(', ') : safeField;
};

export const getEscapedFields = result => {
    return Object.keys(result).reduce((acc, field) => {
        return {...acc, [field]: getEscapedField(result, field)};
    }, {});
};

export const getFileIcon = mimeType => {
    switch (mimeType) {
        case mimeTypes.PDF: return <BsFileEarmarkPdf/>;
        default: return <BsFileEarmarkText/>;
    }
};

export const getIcon = (nodeType, mimeType) => {
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

export const getNodeTypeKey = (nodeType, mimeType, i18n) => {
    const nt = nodeTypes('J2S');
    const key = nt[nodeType] || 'DEFAULT';

    if (key === 'FILE' && i18n.exists(`config.mimeTypes.${mimeType}`)) {
        return `config.mimeTypes.${mimeType}`;
    }

    return `config.nodeTypes.${key}`;
};

export const getURLStream = url => {
    return url.replace('.html', '').split('/').reduce((string, item, index) => {
        if (!item) {
            return string;
        }

        if (index === 1) {
            return item;
        }

        return `${string} > ${item} `;
    }, '');
};

export const getNodeTypeColor = nodeType => {
    return nodeTypesColor[nodeType] || 'var(--color-default)';
};
