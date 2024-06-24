import {gql} from '@apollo/client';
import {CORE_NODE_FIELDS} from './fragments';

export const GetImage = gql`
    ${CORE_NODE_FIELDS}
    query getImage($workspace: Workspace!, $id: String!, $language: String!) {
        response: jcr(workspace: $workspace) {
            workspace
            content: nodeById(uuid: $id) {
                ...CoreNodeFields
                image : property(name:"image",){ node: refNode {
                    ...CoreNodeFields
                    title:displayName(language:$language)
                    ajaxRenderUrl
                } }
            }
        }
    }`;

