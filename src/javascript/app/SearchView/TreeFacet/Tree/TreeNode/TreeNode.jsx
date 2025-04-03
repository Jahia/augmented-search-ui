import React from 'react';
import {FaChevronDown, FaChevronRight} from 'react-icons/fa';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {getCategoryTranslation} from '../../../../waGraphQL';
import {JahiaCtx, StoreCtx} from '../../../../context';

const getPaddingLeft = level => level * 20;

const StyledTreeNode = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 8px;
  padding-left: ${props => getPaddingLeft(props.level)}px;
  color: #999;

  &:hover {
    background: lightgray;
  }
`;

const NodeIcon = styled.div`
  font-size: 12px;
  font-weight: 700;
  margin-right: 5px;
`;

const CountSpan = styled.span`
  font-size: 12px;
  font-weight: 700;
  margin-left: auto;
`;

const TitleSpan = styled.span`
  font-size: 13px;
  font-weight: 700;
  text-decoration: ${props => props.selected ? 'underline' : 'none'} !important;
`;

const TreeNode = props => {
    const {node, getChildNodes, level, onToggle, onSelect, onRemove} = props;
    const {workspace, language} = React.useContext(JahiaCtx);
    const {state: {searchLanguage}} = React.useContext(StoreCtx);

    const {data, loading, error, refetch} = useQuery(getCategoryTranslation, {
        variables: {
            workspace,
            language,
            path: `/sites/systemsite/categories${node.rootPath}`
        },
        skip: searchLanguage === language || !Object.prototype.hasOwnProperty.call(node, 'key')
    });

    React.useEffect(() => {
        if (searchLanguage !== language && Object.prototype.hasOwnProperty.call(node, 'key')) {
            refetch({
                path: `/sites/systemsite/categories${node.rootPath}`
            });
        }
    }, [language, refetch, node, searchLanguage]);

    if (error) {
    // Const message = t(
    //     'jcontent:label.jcontent.error.queryingContent',
    //     {details: error.message ? error.message : ''}
    // );

        // console.warn(message);
        console.warn('error todo');
    }

    if (loading) {
        return null;// Note return default results ?
    }

    if (data?.jcr?.node?.title) {
        node.value = data.jcr.node.title;
    }

    return (
        <>
            <StyledTreeNode level={level} type={node.type}>
                <NodeIcon role="button"
                          onClick={e => {
                    e.preventDefault();
                    onToggle(node);
                }}
                >
                    {node.hasChildren && (node.isOpen ? <FaChevronDown/> : <FaChevronRight/>)}
                </NodeIcon>

                <TitleSpan selected={node.selected}
                           role="button"
                           onClick={e => {
                               e.preventDefault();
                               if (node.selected) {
                                   onRemove(node);
                               } else {
                                  onSelect(node);
                               }
                           }}
                >
                    {node.value}
                </TitleSpan>

                <CountSpan>
                    {node.count}
                </CountSpan>
            </StyledTreeNode>

            {node.isOpen && getChildNodes(node).map(childNode => (
                <TreeNode
                    key={childNode.key}
                    {...props}
                    node={childNode}
                    level={level + 1}
                />
            ))}
        </>
    );
};

TreeNode.propTypes = {
    node: PropTypes.object.isRequired,
    getChildNodes: PropTypes.func.isRequired,
    level: PropTypes.number.isRequired,
    onToggle: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default TreeNode;
