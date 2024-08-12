import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './ResultCard.css';
// Import './ResultCardIllustrated.css';
import {getEscapedFields, getRaw} from '../utils';

import placeholder from '../../../assets/placeholder.webp';
import {useQuery} from '@apollo/client';
import {getImage} from '../../../waGraphQL';
import {JahiaCtx} from '../../../context';

export const ResultCardIllustrated = ({titleField, urlField, result}) => {
    const {workspace, language} = React.useContext(JahiaCtx);

    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const price = getRaw(result, 'price');
    const prices = price ? price.split('.') : [];
    const currency = getRaw(result, 'currency');

    // Const mimeType = getRaw(result, 'mimeType');
    const categoriesSet = new Set(JSON.parse(getRaw(result, 'jgql_categories')));
    const categories = [...categoriesSet];
    const tags = getRaw(result, 'tags') || [];

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
        <div className="amz-result-card-wrapper">
            <a href={url || '#'}>
                <div className="amz-result-card">
                    <img className="amz-card-img-top" src={imageProps.src} alt={imageProps.alt}/>
                    <div className="amz-card-body">
                        <h3 className="amz-card-title">{title}</h3>
                        <div dangerouslySetInnerHTML={{__html: fields.excerpt.substring(0, 100)}} className="excerpt"/>
                        {Boolean(prices.length) &&
                            <p className="price" style={{fontSize: '24px'}}>
                                <strong>{prices[0]}</strong>
                                <sup>{prices[1]}&nbsp;{currency}</sup>
                            </p>}

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
                    {/*   */}
                    {/* </div> */}
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
