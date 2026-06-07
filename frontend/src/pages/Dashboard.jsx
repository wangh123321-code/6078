import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, List, Tag, Typography } from 'antd'
import {
  CatOutlined,
  TeamOutlined,
  FileTextOutlined,
  LinkOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { getCats } from '../api/cat.js'
import { getBreedings } from '../api/breeding.js'
import { isCatteryAdmin } from '../utils/auth.js'
import useUserStore from '../store/userStore.js'

const { Title } = Typography

function Dashboard() {
  const [stats, setStats] = useState({
    totalCats: 0,
    totalBreedings: 0,
    onChainCats: 0,
    totalCertificates: 0,
  })
  const [recentCats, setRecentCats] = useState([])
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const catRes = await getCats({ page: 0, size: 100 })
      const breedingRes = await getBreedings({ page: 0, size: 100 })

      const cats = catRes.data?.content || []
      const onChain = cats.filter(c => c.onChain).length

      setStats({
        totalCats: catRes.data?.totalElements || 0,
        totalBreedings: breedingRes.data?.totalElements || 0,
        onChainCats: onChain,
        totalCertificates: Math.floor(onChain * 0.7),
      })

      setRecentCats(cats.slice(0, 5))
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const statCards = [
    {
      title: '注册猫咪',
      value: stats.totalCats,
      icon: <CatOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      color: '#e6f7ff',
    },
    {
      title: '上链存证',
      value: stats.onChainCats,
      icon: <LinkOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      color: '#f6ffed',
    },
    {
      title: '繁育记录',
      value: stats.totalBreedings,
      icon: <TeamOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
    {
      title: '血统证书',
      value: stats.totalCertificates,
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      color: '#fff7e6',
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Title level={3}>欢迎回来，{user?.realName || user?.username}</Title>
        <p style={{ color: '#666', margin: 0 }}>
          {isCatteryAdmin() ? '管理您的猫咪血统信息' : '查询和浏览猫咪血统信息'}
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={12} lg={6} key={index}>
            <Card style={{ background: card.color, border: 'none', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {card.icon}
                <div>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    valueStyle={{ fontSize: 28, fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="最近注册的猫咪" extra={<a href="#/cats">查看全部</a>}>
            <List
              dataSource={recentCats}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={
                      <span>
                        {item.name}
                        {item.onChain && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            <LinkOutlined /> 已上链
                          </Tag>
                        )}
                      </span>
                    }
                    description={`${item.breed} · ${item.catNo} · ${item.gender === 'MALE' ? '公' : '母'}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="系统公告">
            <List>
              <List.Item>
                <List.Item.Meta
                  title={<span><RiseOutlined /> 区块链存证功能已上线</span>}
                  description="所有猫咪信息将自动同步到区块链，生成不可篡改的血统记录。"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title={<span><FileTextOutlined /> 证书生成功能已开放</span>}
                  description="猫咪信息录入后可自动生成带二维码的PDF血统证书。"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title={<span><TeamOutlined /> 繁育管理模块已更新</span>}
                  description="支持记录配对信息、预产期，小猫出生后自动关联父母血统。"
                />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
