import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Popconfirm,
  message,
  Typography,
  Modal,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getCats, deleteCat } from '../api/cat.js'
import { generateCertificate, downloadCertificate } from '../api/certificate.js'
import { importCats, exportCats, downloadTemplate } from '../api/excel.js'
import { isSuperAdmin, isCatteryAdmin } from '../utils/auth.js'

const { Title } = Typography

function CatList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchText, setSearchText] = useState('')
  const [importModal, setImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCats({
        page: pagination.current - 1,
        size: pagination.pageSize,
      })
      setData(res.data?.content || [])
      setPagination(prev => ({
        ...prev,
        total: res.data?.totalElements || 0,
      }))
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchText) {
      loadData()
      return
    }
    setLoading(true)
    try {
      const { searchCats } = await import('../api/cat.js')
      const res = await searchCats(searchText)
      setData(res.data || [])
      setPagination(prev => ({ ...prev, total: res.data?.length || 0 }))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCat(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleGenerateCertificate = async (cat) => {
    try {
      await generateCertificate(cat.id)
      message.success('证书生成成功')
      downloadCertificate(cat.catNo)
    } catch (error) {
      console.error('生成证书失败:', error)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      message.error('请选择要上传的文件')
      return
    }
    try {
      const res = await importCats(importFile)
      message.success(res.message)
      setImportModal(false)
      setImportFile(null)
      loadData()
    } catch (error) {
      console.error('导入失败:', error)
    }
  }

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
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'MALE' ? 'blue' : 'pink'}>
          {gender === 'MALE' ? '公' : '母'}
        </Tag>
      ),
    },
    {
      title: '毛色',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '上链状态',
      dataIndex: 'onChain',
      key: 'onChain',
      render: (onChain) => (
        onChain
          ? <Tag color="green" icon={<LinkOutlined />}>已上链</Tag>
          : <Tag color="orange">未上链</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/cats/${record.catNo}`)}
          >
            查看
          </Button>
          {isCatteryAdmin() && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/cats/${record.catNo}/edit`)}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleGenerateCertificate(record)}
              >
                证书
              </Button>
            </>
          )}
          {isSuperAdmin() && (
            <Popconfirm
              title="确定删除这只猫咪的信息吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>猫咪管理</Title>
        <Space>
          {isCatteryAdmin() && (
            <>
              <Button icon={<UploadOutlined />} onClick={() => setImportModal(true)}>
                批量导入
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => exportCats()}>
                批量导出
              </Button>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/cats/new')}>
                新增猫咪
              </Button>
            </>
          )}
        </Space>
      </div>

      <div className="search-box" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索猫咪名称或编号"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        {isCatteryAdmin() && (
          <Button onClick={() => downloadTemplate()}>
            下载导入模板
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
      />

      <Modal
        title="批量导入猫咪数据"
        open={importModal}
        onOk={handleImport}
        onCancel={() => { setImportModal(false); setImportFile(null); }}
        okText="导入"
        cancelText="取消"
      >
        <p style={{ marginBottom: 16 }}>
          请上传Excel文件（.xlsx或.xls格式），可先下载导入模板填写数据。
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setImportFile(e.target.files[0])}
          style={{ width: '100%' }}
        />
        <Button
          type="link"
          onClick={() => downloadTemplate()}
          style={{ padding: 0, marginTop: 8 }}
        >
          下载导入模板
        </Button>
      </Modal>
    </div>
  )
}

export default CatList
