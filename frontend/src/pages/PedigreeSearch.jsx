import React, { useState } from 'react'
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  message,
  Descriptions,
  Tag,
  Tabs,
  List,
} from 'antd'
import {
  SearchOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getCatByNo, getPedigree, searchCats } from '../api/cat.js'
import { verifyCatOnChain } from '../api/blockchain.js'
import PedigreeTree from '../components/PedigreeTree.jsx'

const { Title, Text } = Typography

function PedigreeSearch() {
  const navigate = useNavigate()
  const [catNo, setCatNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [cat, setCat] = useState(null)
  const [pedigree, setPedigree] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    if (!catNo.trim()) {
      message.warning('请输入猫咪编号')
      return
    }

    setLoading(true)
    setCat(null)
    setPedigree(null)
    setVerifyResult(null)
    setSearchResults([])

    try {
      const [catRes, pedigreeRes, verifyRes] = await Promise.all([
        getCatByNo(catNo),
        getPedigree(catNo, 5),
        verifyCatOnChain(catNo),
      ])

      setCat(catRes.data)
      setPedigree(pedigreeRes.data)
      setVerifyResult(verifyRes.data)
    } catch (error) {
      console.error('查询失败:', error)
      if (error.message?.includes('不存在')) {
        message.error('未找到该猫咪编号的信息')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordSearch = async (keyword) => {
    if (!keyword.trim()) return
    try {
      const res = await searchCats(keyword)
      setSearchResults(res.data || [])
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <IdcardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0, color: '#333' }}>
            纯种猫血统查询
          </Title>
          <p style={{ color: '#666', marginTop: 8 }}>
            输入猫咪编号查询完整血统信息，所有数据已通过区块链存证，不可篡改
          </p>
        </div>

        <Space.Compact style={{ width: '100%', maxWidth: 600, margin: '0 auto 32px', display: 'flex' }}>
          <Input
            size="large"
            placeholder="请输入猫咪编号，例如：CAT001"
            value={catNo}
            onChange={(e) => setCatNo(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            prefix={<IdcardOutlined />}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            查询血统
          </Button>
        </Space.Compact>

        {!cat && (
          <Card
            type="inner"
            title="快速搜索"
            style={{ marginBottom: 24 }}
          >
            <Input.Search
              placeholder="输入猫咪名称搜索"
              allowClear
              enterButton="搜索"
              size="large"
              onSearch={handleKeywordSearch}
              style={{ maxWidth: 400 }}
            />
            {searchResults.length > 0 && (
              <List
                style={{ marginTop: 16 }}
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <a onClick={() => {
                        setCatNo(item.catNo)
                        handleSearch()
                      }}>
                        查询血统
                      </a>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`${item.catNo} · ${item.breed} · ${item.gender === 'MALE' ? '公' : '母'}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        )}

        {cat && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <div>
                    <Card
                      type="inner"
                      title={`${cat.name} 的血统信息`}
                      extra={
                        verifyResult?.valid ? (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            区块链验证通过
                          </Tag>
                        ) : (
                          <Tag color="red">
                            数据可能已篡改
                          </Tag>
                        )
                      }
                    >
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="猫咪编号">
                          <strong>{cat.catNo}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="名称">{cat.name}</Descriptions.Item>
                        <Descriptions.Item label="品种">{cat.breed}</Descriptions.Item>
                        <Descriptions.Item label="性别">
                          <Tag color={cat.gender === 'MALE' ? 'blue' : 'pink'}>
                            {cat.gender === 'MALE' ? '公' : '母'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="毛色">{cat.color || '-'}</Descriptions.Item>
                        <Descriptions.Item label="眼色">{cat.eyeColor || '-'}</Descriptions.Item>
                        <Descriptions.Item label="出生日期">
                          {cat.birthDate ? dayjs(cat.birthDate).format('YYYY-MM-DD') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="芯片号">{cat.microchipNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label="注册编号">{cat.registrationNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label="猫主人">{cat.ownerName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="所属猫舍">{cat.catteryName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="父亲编号">
                          {cat.fatherCatNo ? (
                            <a onClick={() => {
                              setCatNo(cat.fatherCatNo)
                              handleSearch()
                            }} style={{ cursor: 'pointer' }}>
                              {cat.fatherCatNo}
                            </a>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="母亲编号">
                          {cat.motherCatNo ? (
                            <a onClick={() => {
                              setCatNo(cat.motherCatNo)
                              handleSearch()
                            }} style={{ cursor: 'pointer' }}>
                              {cat.motherCatNo}
                            </a>
                          ) : '-'}
                        </Descriptions.Item>
                      </Descriptions>

                      {cat.onChain && (
                        <Card
                          type="inner"
                          title="区块链存证信息"
                          style={{ marginTop: 16 }}
                          size="small"
                        >
                          <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                            <p style={{ margin: '4px 0' }}>
                              <Text strong>区块哈希：</Text>
                              <code style={{ wordBreak: 'break-all' }}>{cat.blockchainHash}</code>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                              <Text strong>交易哈希：</Text>
                              <code style={{ wordBreak: 'break-all' }}>{cat.transactionHash}</code>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                              <Text strong>上链时间：</Text>
                              {cat.onChainTime ? dayjs(cat.onChainTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                            </p>
                          </div>
                        </Card>
                      )}

                      {cat.awards && cat.awards.length > 0 && (
                        <Card
                          type="inner"
                          title={`获奖记录 (${cat.awards.length})`}
                          style={{ marginTop: 16 }}
                          size="small"
                        >
                          <List
                            size="small"
                            dataSource={cat.awards}
                            renderItem={(award, index) => (
                              <List.Item key={index}>
                                <List.Item.Meta
                                  title={award.competitionName}
                                  description={`${award.awardName} · ${award.rank} · ${dayjs(award.awardDate).format('YYYY-MM-DD')}`}
                                />
                              </List.Item>
                            )}
                          />
                        </Card>
                      )}
                    </Card>
                  </div>
                ),
              },
              {
                key: 'pedigree',
                label: '五代系谱图',
                children: (
                  <div>
                    <Card type="inner">
                      <PedigreeTree
                        data={pedigree}
                        onNodeClick={(node) => {
                          setCatNo(node.catNo)
                          handleSearch()
                        }}
                      />
                    </Card>
                  </div>
                ),
              },
            ]}
          />
        )}

        <div style={{ marginTop: 32, textAlign: 'center', paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Space>
            <Tag icon={<LinkOutlined />} color="green">
              区块链存证
            </Tag>
            <Tag color="blue">
              数据不可篡改
            </Tag>
            <Tag color="purple">
              血统可追溯
            </Tag>
          </Space>
          <p style={{ color: '#999', marginTop: 12, fontSize: 12 }}>
            纯种猫协会 · 区块链血统管理系统
          </p>
        </div>
      </Card>
    </div>
  )
}

export default PedigreeSearch
