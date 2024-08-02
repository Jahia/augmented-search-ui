import React from 'react';
import PropTypes from 'prop-types';
import ViewWrapper from '../../ViewWrapper';
import {Result} from '@elastic/react-search-ui/lib/esm/containers';
import './Amz.css';
import {ResultCard} from './ResultCard';
import {ResultCardIllustrated} from './ResultCardIllustrated';
// Import clsx from 'clsx';
// import {JahiaCtx} from '../../../context';
export const Amz = ({wasSearched, results}) => {
    // Const {isFacetDisabled} = React.useContext(JahiaCtx);
    return (
        <div className="result-row">
            <ViewWrapper wasSearched={wasSearched}
                         results={results}
                         fallbackView="Nothing was found"
                         view={results.map(result => {
                             const Cmp = result.image?.raw ? ResultCardIllustrated : ResultCard;
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
                                             result={result}
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
