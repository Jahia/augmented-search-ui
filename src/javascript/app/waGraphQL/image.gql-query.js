import {gql} from '@apollo/client';
import {CORE_NODE_FIELDS} from './fragments';

export const getImage = gql`
    ${CORE_NODE_FIELDS}
    query getImage($workspace: Workspace!, $id: String!, $language: String!) {
        jcr(workspace: $workspace) {
            workspace
            image: nodeById(uuid: $id) {
                ...CoreNodeFields
                title:displayName(language:$language)
                url
            }
        }
    }`;

