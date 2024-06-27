export const mimeTypes = {
    PDF: 'application/pdf'
};

const getFileIcon = mimeType => {
    switch (mimeType) {
        case mimeTypes.PDF: return 'BsFileEarmarkPdf';
        default: return 'BsFileEarmarkText';
    }
};

export const nodeTypesMap = {
    'tint:content': {
        label: {
            t: 'config.nodeTypes.ARTICLE'
        },
        color: 'var(--color-industrial-content)',
        icon: 'BsBodyText'
    },
    'game4nt:quiz': {
        label: {
            t: 'config.nodeTypes.QUIZ'
        },
        color: 'var(--color-quiz)',
        icon: 'BsFillQuestionDiamondFill'
    },
    'jnt:page': {
        label: {
            t: 'config.nodeTypes.PAGE'
        },
        color: 'var(--color-page)',
        icon: 'BsLayoutTextWindowReverse'
    },
    'jnt:file': {
        label: {
            t: 'config.nodeTypes.FILE'
        },
        color: 'var(--color-file)',
        icon: getFileIcon
    },
    'seaddonsnt:trainingSession': {
        label: {
            t: 'config.nodeTypes.TRAINING'
        },
        color: 'var(--color-training)',
        icon: 'BsBank2'
    },
    'seaddonsnt:event': {
        label: {
            t: 'config.nodeTypes.EVENT'
        },
        color: 'var(--color-event)',
        icon: 'BsCalendar2Week'
    }
};
