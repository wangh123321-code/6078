import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Card,
  message,
} from 'antd'
import {
  SearchOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getCats } from '../api/cat.js'
import { generateCertificate, downloadCertificate, getCertificate } from '../api/certificate.js'
import { isCatteryAdmin } from '../utils/auth.js'

const { Title } = Typography

function CertificatePage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [certStatus, setCertStatus] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCats({ page: 0, size: 100 })
      const cats = res.data?.content || []
      setData(cats)

      const statusMap = {}
      for (const cat of cats) {
        try {
          const certRes = await getCertificate(cat.catNo)
          statusMap[cat.id] = certRes.data
        } catch (e) {
          statusMap[cat.id] = null
        }
      }
      setCertStatus(statusMap)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (cat) => {
    try {
      await generateCertificate(cat.id)
      message.success('证书生成成功')
      downloadCertificate(cat.catNo)
      loadData()
    } catch (error) {
      console.error('生成证书失败:', error)
    }
  }

  const handleDownload = (catNo) => {
    downloadCertificate(catNo)
  }

  const filteredData = searchText
    ? data.filter(cat =>
        cat.name.includes(searchText) ||
        cat.catNo.includes(searchText) ||
        cat.breed.includes(searchText)
      )
    : data

  const columns = [
    {
      title: '猫咪编号',
      dataIndex: 'catNo',
      key: 'catNo',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '上链状态',
      dataIndex: 'onChain',
      key: 'onChain',
      render: (onChain) => (
        onChain
          ? <Tag color="green" icon={<CheckCircleOutlined />}>已上链</Tag>
          : <Tag color="orange">未上链</Tag>
      ),
    },
    {
      title: '证书状态',
      key: 'certStatus',
      render: (_, record) => {
        const cert = certStatus[record.id]
        return cert ? (
          <Tag color="green" icon={<FileTextOutlined />}>
            已生成
          </Tag>
        ) : (
          <Tag color="default">未生成</Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const cert = certStatus[record.id]
        return (
          <Space size="small">
            {isCatteryAdmin() && (
              <>
                {!cert && record.onChain && (
                  <Button
                    type="link"
                    size="small"
                    icon={<FileTextOutlined />}
                    onClick={() => handleGenerate(record)}
                  >
                    生成证书
                  </Button>
                )}
                {cert && (
                  <Button
                    type="link"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record.catNo)}
                  >
                    下载
                  </Button>
                )}
              </>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>证书管理</Title>
      </div>

      <div className="search-box" style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索猫咪名称或编号"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
          prefix={<SearchOutlined />}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}

export default CertificatePage
