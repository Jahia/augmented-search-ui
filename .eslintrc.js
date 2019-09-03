module.exports = {
    env: {
        browser: true,
        es6: true
    },
    parser: 'babel-eslint',
    parserOptions: {
        allowImportExportEverywhere: true,
        ecmaVersion: 9,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    extends: ['xo', 'xo-react'],
    rules: {
        semi: "error",
        'react/no-danger': 'ignore',
        indent: ['error', 4, {
            ignoredNodes: ['JSXElement *', 'JSXElement'],
            SwitchCase: 1
        }],
        'no-negated-condition': 'warn',
        'no-useless-escape': 'warn',
        camelcase: 'warn',
        // React specific rules
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 'first'],
        'react/jsx-max-props-per-line': ['error', {
            maximum: 1,
            when: 'multiline'
        }],
        'react/require-default-props': ['ignore']
    },
    settings: {
        react: {
            version: '16.8'
        }
    }
};
