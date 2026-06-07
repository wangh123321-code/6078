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
  Form,
  Input,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getUsers, createUser, updateUser, deleteUser } from '../api/user.js'

const { Title } = Typography
const { Option } = Select

function UserList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getUsers({
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

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue({
      ...user,
      password: '',
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values)
        message.success('更新成功')
      } else {
        await createUser(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const roleColors = {
    SUPER_ADMIN: 'red',
    CATTERY_ADMIN: 'blue',
    USER: 'green',
  }

  const roleText = {
    SUPER_ADMIN: '超级管理员',
    CATTERY_ADMIN: '猫舍管理员',
    USER: '普通用户',
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roleColors[role]}>{roleText[role]}</Tag>
      ),
    },
    {
      title: '猫舍',
      dataIndex: 'catteryName',
      key: 'catteryName',
      render: (name) => name || '-',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.role !== 'SUPER_ADMIN' && (
            <Popconfirm
              title="确定删除该用户吗？"
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
        <Title level={3} style={{ margin: 0 }}>用户管理</Title>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleCreate}>
          新增用户
        </Button>
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
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入用户名" disabled={!!editingUser} />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
              style={{ flex: 1 }}
            >
              <Input.Password placeholder={editingUser ? '不修改请留空' : '请输入密码'} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="realName"
              label="真实姓名"
              rules={[{ required: true, message: '请输入真实姓名' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入真实姓名" />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="phone"
              label="手机号"
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择角色">
                <Option value="SUPER_ADMIN">超级管理员</Option>
                <Option value="CATTERY_ADMIN">猫舍管理员</Option>
                <Option value="USER">普通用户</Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="catteryId" label="猫舍ID" style={{ flex: 1 }}>
              <Input placeholder="猫舍管理员必填" />
            </Form.Item>
            <Form.Item name="catteryName" label="猫舍名称" style={{ flex: 1 }}>
              <Input placeholder="猫舍管理员必填" />
            </Form.Item>
          </div>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserList
