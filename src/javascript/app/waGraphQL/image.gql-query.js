import {gql} from "@apollo/client";
import {CORE_NODE_FIELDS} from "./fragments"

export const GetImage = gql`
    ${CORE_NODE_FIELDS}
    query getImage($workspace: Workspace!, $id: String!, $language: String!) {
        response: jcr(workspace: $workspace) {
            workspace
            media: nodeById(uuid: $id) {
                ...CoreNodeFields
                title:displayName(language:$language)
                ajaxRenderUrl
            }
        }
    }`


