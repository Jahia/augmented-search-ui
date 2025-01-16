import {gql} from '@apollo/client';

export const CORE_NODE_FIELDS = gql`
    fragment CoreNodeFields on JCRNode {
        workspace
        uuid
        path
        name
        primaryNodeType {
            name
            supertypes{name}
        }
        mixinTypes {name}
        site{
            workspace
            uuid
            displayName
        }
    }`;

export const QUIZ_STATIC_LABELS = gql`
    fragment QuizStaticLabels on JCRNode {
        btnStart: property(language:$language, name:"game4:btnStart"){value}
        btnSubmit: property(language:$language, name:"game4:btnSubmit"){value}
        btnQuestion: property(language:$language, name:"game4:btnQuestion"){value}
        btnNextQuestion: property(language:$language, name:"game4:btnNextQuestion"){value}
        btnShowResults: property(language:$language, name:"game4:btnShowResults"){value}
        btnReset: property(language:$language, name:"game4:btnReset"){value}
        consentTitle: property(language:$language, name:"game4:consentTitle"){value}
        correctAnswer: property(language:$language, name:"game4:correctAnswer"){value}
        wrongAnswer: property(language:$language, name:"game4:wrongAnswer"){value}
    }`;

export const MEDIA_PROPERTY = gql`
    ${CORE_NODE_FIELDS}
    fragment MediaProperty on JCRNode {
        media: property(name:"game4:image",){ node: refNode { ...CoreNodeFields } }
    }`;
