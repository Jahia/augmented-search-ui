import ViewWrapper from '../../ViewWrapper';
import {ResultViewIllustrated} from '../Ggle/ResultViewIllustrated';
import {ResultView} from '../Ggle/ResultView';
import {Result} from '@elastic/react-search-ui/lib/esm/containers';
import PropTypes from 'prop-types';
import React from 'react';
import './Amz.css';
export const Amz = ({wasSearched, results}) => {
    return (
        <div className="result-row">
            <ViewWrapper wasSearched={wasSearched}
                         results={results}
                         fallbackView="Nothing was found"
                         view={results.map(result => {
                             const Cmp = result.image?.raw ? ResultViewIllustrated : ResultView;
                             return (
                                 <div key={result.id.raw} className="result-card">
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
