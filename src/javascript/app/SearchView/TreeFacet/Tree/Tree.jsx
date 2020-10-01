import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import TreeNode from './TreeNode/TreeNode';

export const Tree = ({options}) => {
    const [optionsState, setOptions] = useState(options);
    useEffect(() => {
        console.log(optionsState);
        console.log('Use effect', options);
    });

    const onToggle = node => {
        const toggledOptions = [...optionsState];
        toggledOptions.find(option => option.value === node.value).isOpen = !node.isOpen;
        setOptions(toggledOptions);
    };

    const getChildNodes = node => {
        if (!node.children) {
            return [];
        }

        const childNodes = node.children.map(path => options.find(option => path === option.path));
        console.log(childNodes);
        return childNodes;
    };

    return (
        <div>
            { optionsState.filter(node => node.isRoot === true).map(node => (
                <TreeNode
                    key={node.value}
                    node={node}
                    getChildNodes={getChildNodes}
                    level={0}
                    onToggle={onToggle}/>
            ))}
        </div>
    );
};

Tree.propTypes = {
    options: PropTypes.array.isRequired
};
