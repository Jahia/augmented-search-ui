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
    const categoriesSet = new Set(JSON.parse(getRaw(result, 'jgql_categories')));
    const categories = [...categoriesSet];
    const tags = getRaw(result, 'tags') || [];

    return (
        <div className="amz-result-card-wrapper">
            <a href={url || '#'}>
                <div className="amz-result-card">
                    <div className="amz-card-icon" style={{background: getNodeTypeColor({nodeTypesMap, nodeType})}}>
                        {getIcon({nodeTypesMap, nodeType, mimeType})}
                    </div>
                    <div className="amz-card-body">
                        <h3 className="amz-card-title">{title}</h3>
                        <div dangerouslySetInnerHTML={{__html: fields.excerpt.substring(0, 100)}} className="excerpt"/>
                        <ul>
                            {categories.map(category => (<li key={category}><span className="badge category"> {category} </span></li>))}
                            {tags.map(tag => (<li key={tag}><span className="badge tag"> {tag} </span></li>))}
                        </ul>
                    </div>
                    {/* <div className="amz-card-footer"> */}
                    {/*    /!* <div className="col-4 text-center list-date"> *!/ */}
                    {/*    /!*    <div className="list-label">${until}</div> *!/ */}
                    {/*    /!*    <div className="list-month font-weight-bold d-block">${formatedDateMonth}</div> *!/ */}
                    {/*    /!*    <div className="list-year">${formatedDateYear}</div> *!/ */}
                    {/*    /!* </div> *!/ */}
                    {/*    <div className="col">{categories}</div> */}
                    {/* </div> */}
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
