const _nodeTypes = {
    ARTICLE: 'tint:content',
    QUIZ: 'game4nt:quiz',
    PAGE: 'jnt:page',
    FILE: 'jnt:file',
    TRAINING: 'seaddonsnt:trainingSession',
    EVENT: 'seaddonsnt:event'
};

export const nodeTypes = order => {
    if (order === 'J2S') {
        return Object.keys(_nodeTypes).reduce((obj, key) => {
            obj[_nodeTypes[key]] = key;
            return obj;
        }, {});
    }

    return _nodeTypes;
};

export const mimeTypes = {
    PDF: 'application/pdf'
};

export const nodeTypesColor = {
    'game4nt:quiz': 'var(--color-quiz)',
    'tint:content': 'var(--color-industrial-content)',
    'jnt:content': 'var(--color-content)',
    'jnt:page': 'var(--color-page)',
    'jnt:file': 'var(--color-file)',
    'seaddonsnt:trainingSession': 'var(--color-training)',
    'seaddonsnt:event': 'var(--color-event)'
};
