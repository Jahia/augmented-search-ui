import React from 'react';
import {FaChevronDown, FaChevronRight} from 'react-icons/fa';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const getPaddingLeft = level => level * 20;

const StyledTreeNode = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 8px;
  padding-left: ${props => getPaddingLeft(props.level, props.type)}px;
  color: #999;

  &:hover {
    background: lightgray;
  }
`;

const NodeIcon = styled.div`
  font-size: 12px;
  font-weight: 700;
  margin-right: ${props => props.marginRight ? props.marginRight : 5}px;
`;

const CountSpan = styled.span`
  font-size: 12px;
  font-weight: 700;
  margin-left: auto;
`;

const TitleSpan = styled.span`
  font-size: 13px;
  font-weight: 700;
`;

const TreeNode = props => {
    const {node, getChildNodes, level, onToggle, onNodeSelect} = props;
    console.log(props, 'TreeNode props');

    return (
        <React.Fragment>
            <StyledTreeNode level={level} type={node.type}>
                <NodeIcon onClick={e => {
                    e.preventDefault();
                    onToggle(node);
                }}
                >
                    {node.children.length > 0 && (node.isOpen ? <FaChevronDown/> : <FaChevronRight/>)}
                </NodeIcon>

                <TitleSpan role="button" onClick={() => onNodeSelect(node)}>
                    {node.title}
                </TitleSpan>

                <CountSpan>
                    {node.count}
                </CountSpan>
            </StyledTreeNode>

            {node.isOpen && getChildNodes(node).map(childNode => (
                <TreeNode
                    key={childNode.value}
                    {...props}
                    node={childNode}
                    level={level + 1}
                />
            ))}
        </React.Fragment>
    );
};

TreeNode.propTypes = {
    node: PropTypes.object.isRequired,
    getChildNodes: PropTypes.func.isRequired,
    level: PropTypes.number.isRequired,
    onToggle: PropTypes.func.isRequired,
    onNodeSelect: PropTypes.func.isRequired
};

export default TreeNode;
