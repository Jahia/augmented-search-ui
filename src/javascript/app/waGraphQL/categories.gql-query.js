import {gql} from '@apollo/client';
import {CORE_NODE_FIELDS} from './fragments';

export const getCategoryTranslation = gql`
    ${CORE_NODE_FIELDS}
    query getCategoryTranslation($workspace: Workspace!, $path: String!, $language: String!) {
        jcr(workspace: $workspace) {
            workspace
            node: nodeByPath(path: $path) {
                ...CoreNodeFields
                title:displayName(language:$language)
            }
        }
    }`;

