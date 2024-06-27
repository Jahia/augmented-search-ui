import React from 'react';
import * as _ from 'lodash';
import * as Icons from 'react-icons/bs';

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

const getIconName = ({nodeTypesMap, nodeType, mimeType}) => {
    const nodeTypeMap = nodeTypesMap[nodeType];
    if (!nodeTypeMap) {
        return 'BsFileEarmarkText';
    }

    if (typeof nodeTypeMap.icon === 'function') {
        return nodeTypeMap.icon(mimeType);
    }

    return nodeTypeMap.icon;
};

export const getIcon = ({nodeTypesMap, nodeType, mimeType}) => {
    const Cmp = Icons[getIconName({nodeTypesMap, nodeType, mimeType})];
    return <Cmp/>;
};

export const getNodeTypeLabel = ({nodeTypesMap, nodeType, mimeType, i18n, language}) => {
    const nodeTypeMap = nodeTypesMap[nodeType];

    if (!nodeTypeMap) {
        return 'config.nodeTypes.DEFAULT';
    }

    if (nodeType === 'jnt:file' && i18n.exists(`config.mimeTypes.${mimeType}`)) {
        return `config.mimeTypes.${mimeType}`;
    }

    return nodeTypeMap.label[language] || nodeTypeMap.label.t;
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

export const getNodeTypeColor = ({nodeTypesMap, nodeType}) => {
    const nodeTypeMap = nodeTypesMap[nodeType];
    return nodeTypeMap?.color || 'var(--color-default)';
};
