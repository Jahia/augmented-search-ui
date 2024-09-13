import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './ResultView.css';
import './ResultViewIllustrated.css';
import {useTranslation} from 'react-i18next';
import {getEscapedFields, getIcon, getNodeTypeColor, getNodeTypeLabel, getRaw, getURLStream} from '../utils';
import {DateComponent} from './DateComponent';
import {JahiaCtx} from '../../../context';
import {useQuery} from '@apollo/client';
import {getImage} from '../../../waGraphQL';
import placeholder from '../../../assets/placeholder.webp';
export const ResultViewIllustrated = ({id, titleField, urlField, result}) => {
    const {t, i18n} = useTranslation();
    const {workspace, language, nodeTypesMap} = React.useContext(JahiaCtx);

    const fields = getEscapedFields(result);
    const title = getRaw(result, titleField);
    // Const title = getEscapedField(result, titleField);
    const url = getRaw(result, urlField);
    const nodeType = getRaw(result, 'nodeType');
    const mimeType = getRaw(result, 'mimeType');
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
                src: data.jcr.image.url.replace(/\.ajax$/, ''),
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
        <div key={id}
             className="result"
        >
            <a href={url || '#'} style={{color: getNodeTypeColor({nodeTypesMap, nodeType})}}>
                <div className="flex-b">
                    <div className="block-img">
                        <div>
                            <img src={imageProps.src} alt={imageProps.alt}/>
                        </div>
                    </div>
                    <div className="block-txt">
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
                    </div>
                </div>
            </a>
        </div>
    );
};

ResultViewIllustrated.propTypes = {
    id: PropTypes.string,
    titleField: PropTypes.string,
    urlField: PropTypes.string,
    result: PropTypes.object
};
