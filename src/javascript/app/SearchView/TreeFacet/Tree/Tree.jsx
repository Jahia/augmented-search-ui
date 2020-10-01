import React, {useState} from 'react';
import PropTypes from 'prop-types';

import TreeNode from './TreeNode/TreeNode';

export const Tree = ({options, onSelect}) => {
    const [optionsState, setOptions] = useState(options);

    const onToggle = node => {
        console.log('Options before flag', options);
        const toggledOptions = [...optionsState];
        toggledOptions.find(option => option.value === node.value).isOpen = !node.isOpen;
        setOptions(toggledOptions);
        console.log('Options after flag change', toggledOptions);
    };

    const getChildNodes = node => {
        console.log('Childnodes', node);
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
                    onToggle={onToggle}
                    onNodeSelect={onSelect}/>
            ))}
        </div>
    );
};

Tree.propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired
};
