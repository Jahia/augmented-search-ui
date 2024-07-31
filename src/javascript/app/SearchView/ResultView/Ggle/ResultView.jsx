import React from 'react';
import PropTypes from 'prop-types';
import './ResultView.css';
import {useTranslation} from 'react-i18next';
import {getEscapedFields, getIcon, getNodeTypeColor, getNodeTypeLabel, getRaw, getURLStream} from '../utils';
import {DateComponent} from './DateComponent';
import {JahiaCtx} from '../../../context';

export const ResultView = ({id, titleField, urlField, result}) => {
    const {t, i18n} = useTranslation();
    const {nodeTypesMap, language} = React.useContext(JahiaCtx);

    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const nodeType = getRaw(result, 'nodeType');
    const mimeType = getRaw(result, 'mimeType');

    return (
        <div key={id}
             className="result"
        >
            <a href={url || '#'} style={{color: getNodeTypeColor({nodeTypesMap, nodeType})}}>
                <br/>
                <h3>{title}</h3>
                <div className="excerpt">
                    <DateComponent {...{result, t}}/>
                    <span dangerouslySetInnerHTML={{__html: fields.excerpt}}/>
                </div>
                <div className="header">
                    <span>
                        <div>
                            {getIcon({nodeTypesMap, nodeType, mimeType})}
                        </div>
                    </span>
                    <div className="content">
                        <span>{t(getNodeTypeLabel({nodeTypesMap, nodeType, mimeType, i18n, language}))}</span>
                        <div className="element">
                            <cite>
                                {/* {window.location.origin} */}
                                <span>{getURLStream(url)}</span>
                            </cite>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};

ResultView.propTypes = {
    id: PropTypes.string,
    titleField: PropTypes.string,
    urlField: PropTypes.string,
    result: PropTypes.object
};
