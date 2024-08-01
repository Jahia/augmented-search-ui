import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
// Import './ResultCardIllustrated.css';
import {getEscapedFields, getNodeTypeColor, getRaw} from '../utils';

import placeholder from '../../../assets/placeholder.webp';
import {useQuery} from '@apollo/client';
import {getImage} from '../../../waGraphQL';
import {JahiaCtx} from '../../../context';
export const ResultCardIllustrated = ({titleField, urlField, result}) => {
    const {workspace, language, nodeTypesMap} = React.useContext(JahiaCtx);

    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const nodeType = getRaw(result, 'nodeType');
    // Const mimeType = getRaw(result, 'mimeType');
    const categoriesSet = new Set(JSON.parse(getRaw(result, 'jgql_categories')));
    const categories = [...categoriesSet];
    const imageId = getRaw(result, 'image');
    const [imageProps, setImageProps] = useState({src: placeholder, alt: 'placeholder'});

    const {data, loading, error} = useQuery(getImage, {
        variables: {
            workspace,
            language,
            id: imageId
        },
        skip: !imageId
    });

    useEffect(() => {
        if (!error && !loading && data?.jcr?.image) {
            setImageProps({
                src: data.jcr.image.ajaxRenderUrl.replace(/\.ajax$/, ''),
                alt: data.jcr.image.title
            });
        }
    }, [data, error, loading]);

    if (error) {
        // Const message = t(
        //     'jcontent:label.jcontent.error.queryingContent',
        //     {details: error.message ? error.message : ''}
        // );

        // console.warn(message);
        console.warn('error todo');
    }

    if (loading) {
        return null;// Note return default image path
    }

    return (
        <div className="result-card">
            <a href={url || '#'} style={{color: getNodeTypeColor({nodeTypesMap, nodeType})}}>
                <img className="card-img-top" src={imageProps.src} alt={imageProps.alt}/>
                <div className="card-banner">
                    {/* <div className="col-4 text-center list-date"> */}
                    {/*    <div className="list-label">${until}</div> */}
                    {/*    <div className="list-month font-weight-bold d-block">${formatedDateMonth}</div> */}
                    {/*    <div className="list-year">${formatedDateYear}</div> */}
                    {/* </div> */}
                    <div className="col">
                        {categories.map(category => (<span key={category}> {category} </span>))}
                    </div>
                </div>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div dangerouslySetInnerHTML={{__html: fields.excerpt}} className="card-text"/>
                </div>
            </a>
        </div>
    );
};

ResultCardIllustrated.propTypes = {
    // Id: PropTypes.string,
    titleField: PropTypes.string,
    urlField: PropTypes.string,
    result: PropTypes.object
};
