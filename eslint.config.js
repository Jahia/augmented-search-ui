// Jahia's eslint-config is not updated for babel 8 + eslint 9 yet, so I moved this config here until it is
import { defineConfig } from "eslint/config";
import xo from "eslint-config-xo";
import xoReact from "eslint-config-xo-react";
import eslintParserBabel from "@babel/eslint-parser";

export default defineConfig({
    languageOptions: {
        parser: eslintParserBabel,
        parserOptions: {
            allowImportExportEverywhere: true
        },
        globals: {
            contextJsParameters: false
        }
    },
    extends: [xo, xoReact],
    settings: {
        react: {
            version: '19.2'
        }
    },
    files: ["src/**/*.js", "src/**/*.jsx"],
    ignores: ["**/main/resources/**"],
    rules: {
        // ESLint base rules
        '@stylistic/indent': [
            'error',
            4,
            {
                ignoredNodes: ['JSXElement *', 'JSXElement'],
                SwitchCase: 1
            }
        ],
        'no-negated-condition': 'warn',
        'no-useless-escape': 'warn',
        'camelcase': 'error',
        '@stylistic/comma-dangle': ['error', 'never'],
        'operator-linebreak': ['error', 'after'],
        // React specific rules
        'react/jsx-fragments': 'off',
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 'first'],
        'react/jsx-first-prop-new-line': 0,
        'react/jsx-max-props-per-line': ['error', {
            maximum: 1,
            when: 'multiline'
        }],
        'react/require-default-props': 0,
        'react/static-property-placement': 0,
        'react/state-in-constructor': 0,
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function'
            }
        ],
        'react/jsx-no-useless-fragment': ['error', {allowExpressions: true}],
        'jsx-quotes': [
            'error',
            'prefer-double'
        ],
        "react/no-danger": "off",
        "react/boolean-prop-naming": "off"
    }
});
