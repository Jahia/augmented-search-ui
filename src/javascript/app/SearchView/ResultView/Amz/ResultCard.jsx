import React from 'react';
import PropTypes from 'prop-types';
import './ResultCard.css';
import {getEscapedFields, getIcon, getNodeTypeColor, getRaw} from '../utils';
import {nodeTypesMap} from '../../../config';
export const ResultCard = ({titleField, urlField, result}) => {
    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const nodeType = getRaw(result, 'nodeType');
    const mimeType = getRaw(result, 'mimeType');
    const categories = new Set(getRaw(result, 'jgql_categories'));

    return (
        <div className="result-card">
            <a href={url || '#'} style={{color: getNodeTypeColor({nodeTypesMap, nodeType})}}>
                {getIcon({nodeTypesMap, nodeType, mimeType})}
                {/* <img className="card-img-top" src="${imageURL}" alt="${title}"/> */}
                <div className="card-banner">
                    {/* <div className="col-4 text-center list-date"> */}
                    {/*    <div className="list-label">${until}</div> */}
                    {/*    <div className="list-month font-weight-bold d-block">${formatedDateMonth}</div> */}
                    {/*    <div className="list-year">${formatedDateYear}</div> */}
                    {/* </div> */}
                    <div className="col">{categories}</div>
                </div>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div dangerouslySetInnerHTML={{__html: fields.excerpt}} className="card-text"/>
                </div>
            </a>
        </div>
    );
};

ResultCard.propTypes = {
    // Id: PropTypes.string,
    titleField: PropTypes.string,
    urlField: PropTypes.string,
    result: PropTypes.object
};
