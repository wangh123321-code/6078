import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Modal,
  Input,
  Form,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getBreedings, updateBreedingStatus, deleteBreeding } from '../api/breeding.js'
import { isSuperAdmin, isCatteryAdmin } from '../utils/auth.js'

const { Title } = Typography
const { Option } = Select

function BreedingList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [kittenModal, setKittenModal] = useState(false)
  const [currentBreeding, setCurrentBreeding] = useState(null)
  const [kittenForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getBreedings({
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

  const handleStatusChange = async (id, status) => {
    try {
      await updateBreedingStatus(id, status)
      message.success('状态更新成功')
      loadData()
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteBreeding(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleAddKitten = async (values) => {
    try {
      const { addKitten } = await import('../api/breeding.js')
      await addKitten(currentBreeding.id, values.kittenCatNo)
      message.success('幼猫关联成功')
      setKittenModal(false)
      kittenForm.resetFields()
      loadData()
    } catch (error) {
      console.error('关联幼猫失败:', error)
    }
  }

  const statusColors = {
    PENDING: 'default',
    MATED: 'blue',
    PREGNANT: 'orange',
    BORN: 'green',
    CANCELLED: 'red',
  }

  const statusText = {
    PENDING: '待配种',
    MATED: '已交配',
    PREGNANT: '已怀孕',
    BORN: '已出生',
    CANCELLED: '已取消',
  }

  const columns = [
    {
      title: '繁育编号',
      dataIndex: 'breedingNo',
      key: 'breedingNo',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '父亲',
      key: 'father',
      render: (_, record) => (
        <div>
          <div>{record.fatherName}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{record.fatherCatNo}</div>
        </div>
      ),
    },
    {
      title: '母亲',
      key: 'mother',
      render: (_, record) => (
        <div>
          <div>{record.motherName}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{record.motherCatNo}</div>
        </div>
      ),
    },
    {
      title: '交配日期',
      dataIndex: 'matingDate',
      key: 'matingDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '预产期',
      dataIndex: 'expectedDueDate',
      key: 'expectedDueDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '实际出生',
      dataIndex: 'actualBirthDate',
      key: 'actualBirthDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '幼崽数量',
      dataIndex: 'litterSize',
      key: 'litterSize',
      render: (size) => size || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{statusText[status]}</Tag>
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
            onClick={() => navigate(`/cats/${record.fatherCatNo}`)}
          >
            父
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/cats/${record.motherCatNo}`)}
          >
            母
          </Button>
          {isCatteryAdmin() && (
            <>
              <Select
                size="small"
                style={{ width: 100 }}
                value={record.status}
                onChange={(value) => handleStatusChange(record.id, value)}
              >
                <Option value="PENDING">待配种</Option>
                <Option value="MATED">已交配</Option>
                <Option value="PREGNANT">已怀孕</Option>
                <Option value="BORN">已出生</Option>
                <Option value="CANCELLED">已取消</Option>
              </Select>
              {record.status === 'PREGNANT' || record.status === 'BORN' ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setCurrentBreeding(record)
                    setKittenModal(true)
                  }}
                >
                  关联幼猫
                </Button>
              ) : null}
            </>
          )}
          {isSuperAdmin() && (
            <Popconfirm
              title="确定删除这条繁育记录吗？"
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
        <Title level={3} style={{ margin: 0 }}>繁育管理</Title>
        {isCatteryAdmin() && (
          <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/breedings/new')}>
            新增繁育记录
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
        title="关联幼猫"
        open={kittenModal}
        onCancel={() => setKittenModal(false)}
        footer={null}
      >
        <Form form={kittenForm} layout="vertical" onFinish={handleAddKitten}>
          <Form.Item name="kittenCatNo" label="幼猫编号" rules={[{ required: true }]}>
            <Input placeholder="请输入已注册的幼猫编号" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">关联</Button>
              <Button onClick={() => setKittenModal(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BreedingList
