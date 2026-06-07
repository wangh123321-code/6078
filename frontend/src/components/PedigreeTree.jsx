import React from 'react'
import { Card, Space, Typography } from 'antd'

const { Text } = Typography

function PedigreeTree({ data, onNodeClick }) {
  if (!data) return null

  const renderNode = (node, level = 0) => {
    if (!node) return null

    const isMale = node.gender === 'MALE'
    const nodeStyle = {
      padding: '8px 12px',
      border: `2px solid ${isMale ? '#1890ff' : '#eb2f96'}`,
      borderRadius: 8,
      background: isMale ? '#e6f7ff' : '#fff0f6',
      textAlign: 'center',
      minWidth: 120,
      cursor: onNodeClick ? 'pointer' : 'default',
    }

    const hasParents = node.father || node.mother
    const maxLevel = 5

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={nodeStyle}
          onClick={() => onNodeClick && onNodeClick(node)}
        >
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>{node.name}</div>
          <div style={{ fontSize: 11, color: '#666' }}>{node.catNo}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{node.breed}</div>
        </div>

        {hasParents && level < maxLevel - 1 && (
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 12, background: '#ddd' }} />
              {renderNode(node.father, level + 1)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 12, background: '#ddd' }} />
              {renderNode(node.mother, level + 1)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pedigree-container">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          {renderNode(data)}
        </div>
        <div style={{ marginTop: 16, textAlign: 'center', color: '#666', fontSize: 12 }}>
          <Text type="secondary">
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#e6f7ff', border: '1px solid #1890ff', marginRight: 4 }} />
            公猫
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#fff0f6', border: '1px solid #eb2f96', margin: '0 4px 0 16px' }} />
            母猫
          </Text>
        </div>
      </Space>
    </div>
  )
}

export default PedigreeTree
