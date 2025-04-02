import React from 'react';
import PropTypes from 'prop-types';
import ViewWrapper from '../../ViewWrapper';
import {Result} from '@elastic/react-search-ui/lib/esm/containers';
import './Amz.css';
import {ResultCard} from './ResultCard';
import {ResultCardIllustrated} from './ResultCardIllustrated';
// Import clsx from 'clsx';
// import {JahiaCtx} from '../../../context';
import {JahiaCtx, StoreCtx} from '../../../context';
import {useQuery} from '@apollo/client';
import {getResultsTranslation} from '../../../waGraphQL';
export const Amz = ({wasSearched, results}) => {
    // Const {isFacetDisabled} = React.useContext(JahiaCtx);
    const {workspace, language} = React.useContext(JahiaCtx);
    const {state: {searchLanguage}} = React.useContext(StoreCtx);

    const {data, loading, error} = useQuery(getResultsTranslation, {
        variables: {
            workspace,
            language,
            nodes: results.map(result => result.id.raw)
        },
        skip: searchLanguage === language || results.length === 0
    });

    if (error) {
        // Const message = t(
        //     'jcontent:label.jcontent.error.queryingContent',
        //     {details: error.message ? error.message : ''}
        // );

        // console.warn(message);
        console.warn('error todo');
    }

    if (loading) {
        return null;// Note return default results ?
    }

    return (
        <div className="result-row">
            <ViewWrapper wasSearched={wasSearched}
                         results={results}
                         fallbackView="Nothing was found"
                         view={results.map(result => {
                             const Cmp = result.image?.raw ? ResultCardIllustrated : ResultCard;

                             const translatedNode = data?.jcr?.nodes?.find(({uuid}) => uuid === result.id.raw);

                             const formatedResult = {
                                 ...result,
                                 title: {raw: translatedNode?.title || result.title.raw},
                                 excerpt: {snippet: translatedNode?.description?.value || result.excerpt.snippet},
                                link: {raw: translatedNode?.url?.replace(/null/, language) || result.link.raw},
                                jgql_categories: {raw: JSON.stringify(translatedNode?.categories?.nodes?.map(node => node.title)) || result.jgql_categories.raw}
                             };

                             return (
                                 <div key={result.id.raw}
                                      className="result-col-md-4"
                                 //      ClassName={clsx({
                                 //     'result-col-md-4': isFacetDisabled,
                                 //     'result-col-md-6': !isFacetDisabled
                                 // })}
                                 >
                                     <Result
                                             id={result.id.raw}
                                             view={Cmp}
                                             result={formatedResult}
                                             titleField="title"
                                             urlField="link"
                                    />
                                 </div>
                             );
                         }
                     )}/>
        </div>
    );
};

Amz.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array
};
