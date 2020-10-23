import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import TreeNode from './TreeNode/TreeNode';

export const Tree = ({options, onSelect, onRemove}) => {
    const [optionsState, setOptions] = useState(options);

    useEffect(() => {
        const mappedOptions = options.reduce((accumulator, currentOption) => {
            const correspondingOptionFromState = optionsState.find(option => option.value === currentOption.value);
            if (correspondingOptionFromState) {
                return [...accumulator, {...currentOption, isOpen: correspondingOptionFromState.isOpen}];
            }

            return [...accumulator, {...currentOption, isOpen: false}];
        }, []);
        setOptions(mappedOptions);
    }, [options]);

    const onToggle = node => {
        const toggledOptions = [...optionsState];
        toggledOptions.find(option => option.value === node.value).isOpen = !node.isOpen;
        setOptions(toggledOptions);
    };

    const getChildNodes = node => {
        if (!node.children) {
            return [];
        }

        return node.children.map(path => optionsState.find(option => path === option.path));
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
                    onSelect={onSelect}
                    onRemove={onRemove}/>
            ))}
        </div>
    );
};

Tree.propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};
