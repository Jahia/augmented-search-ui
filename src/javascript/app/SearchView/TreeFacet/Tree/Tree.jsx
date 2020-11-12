import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {SearchContext} from '@elastic/react-search-ui';
import TreeNode from './TreeNode/TreeNode';

function filterSearchParameters({
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField
}) {
    return {
        current,
        filters,
        resultsPerPage,
        searchTerm,
        sortDirection,
        sortField
    };
}

function filterFacets(facets, node, field) {
    const treeFacets = {};
    treeFacets[field] = {...facets[field], rootPath: node.rootPath};
    return treeFacets;
}

const Tree = ({options, onSelect, onRemove, field}) => {
    const [optionsState, setOptions] = useState(options);
    const context = useContext(SearchContext);
    useEffect(() => {
        const mappedOptions = options.reduce((accumulator, currentOption) => {
            const correspondingOptionFromState = optionsState.find(option => option.key === currentOption.key);

            function getSelected() {
                let filteredField = context.driver.state.filters.find(filter => filter.field === field);
                return Boolean(filteredField && filteredField.values.find(value => value === correspondingOptionFromState.filter));
            }

            if (correspondingOptionFromState) {
                return [...accumulator, {
                    ...currentOption,
                    isOpen: correspondingOptionFromState.isOpen,
                    selected: getSelected(),
                    children: correspondingOptionFromState.children
                }];
            }

            return [...accumulator, {...currentOption, isOpen: false, selected: false}];
        }, []);
        setOptions(mappedOptions);
    }, [options]);

    const onToggle = node => {
        const toggledOptions = [...optionsState];
        const requestState = {
            ...filterSearchParameters(context.driver.state),
            filters: context.driver.state.filters.filter(filter => filter.field !== field)
        };
        const queryConfig = {
            ...context.driver.searchQuery,
            // eslint-disable-next-line camelcase
            result_fields: [],
            facets: filterFacets(
                context.driver.searchQuery.facets,
                node,
                field
            )
        };
        context.driver.events.search(requestState, queryConfig).then(response => {
            node.children = response.facets[field][0].data;
            node.isOpen = !node.isOpen;

            let filteredField = context.driver.state.filters.find(filter => filter.field === field);
            node.children.forEach(children => {
                children.selected = Boolean(filteredField && filteredField.values.find(value => value === children.filter));
            });
            setOptions(toggledOptions);
        });
    };

    const getChildNodes = node => {
        if (!node.hasChildren || node.children === undefined) {
            return [];
        }

        return node.children;
    };

    const nodeOnSelect = node => {
        const selectedOptions = [...optionsState];
        onSelect(node.filter);
        node.selected = true;
        setOptions(selectedOptions);
    };

    const nodeOnRemove = node => {
        const selectedOptions = [...optionsState];
        onRemove(node.filter);
        node.selected = false;
        setOptions(selectedOptions);
    };

    return (
        <div>
            {optionsState.map(node => (
                <TreeNode
                    key={node.key}
                    node={node}
                    getChildNodes={getChildNodes}
                    level={0}
                    onToggle={onToggle}
                    onSelect={nodeOnSelect}
                    onRemove={nodeOnRemove}/>
            ))}
        </div>
    );
};

Tree.propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    field: PropTypes.string.isRequired
};

export default Tree;
