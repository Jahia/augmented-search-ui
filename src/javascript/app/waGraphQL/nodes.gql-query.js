import {gql} from '@apollo/client';
import {CORE_NODE_FIELDS} from './fragments';

export const getResultsTranslation = gql`
    ${CORE_NODE_FIELDS}
    query getResultsTranslation($workspace: Workspace!, $nodes: [String!]!, $language: String!) {
        jcr(workspace: $workspace) {
            workspace
            nodes: nodesById(uuids: $nodes) {
                ...CoreNodeFields
                title:displayName(language:$language)
                teaser:property(language:$language, name:"teaser"){value}
                description:property(language:$language, name:"description"){value}
                categories: property(language:$language,name:"j:defaultCategory",){ nodes: refNodes { ...CoreNodeFields title:displayName(language:$language)} }
                url
            }
        }
    }`;

