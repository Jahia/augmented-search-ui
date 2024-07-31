import {ResultViewIllustrated} from './ResultViewIllustrated';
import {ResultView} from './ResultView';
import {Result} from '@elastic/react-search-ui/lib/esm/containers';
import ViewWrapper from '../../ViewWrapper';
import React from 'react';
import PropTypes from 'prop-types';

export const Ggle = ({wasSearched, results}) => {
    return (
        <ViewWrapper wasSearched={wasSearched}
                     results={results}
                     fallbackView="Nothing was found"
                     view={results.map(result => {
                             const Cmp = result.image?.raw ? ResultViewIllustrated : ResultView;
                             return (
                                 <Result key={result.id.raw}
                                         id={result.id.raw}
                                         view={Cmp}
                                         result={result}
                                         titleField="title"
                                         urlField="link"
                                 />
                             );
                         }
                     )}/>
    );
};

Ggle.propTypes = {
    wasSearched: PropTypes.bool,
    results: PropTypes.array
};
