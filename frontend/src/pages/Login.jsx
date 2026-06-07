import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, CatOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../store/userStore.js'

function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const login = useUserStore((state) => state.login)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CatOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <h2 style={{ margin: 0, color: '#333' }}>纯种猫血统管理系统</h2>
          <p style={{ color: '#666', marginTop: 8 }}>区块链存证 · 不可伪造 · 快速查询</p>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: 'admin123' }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 16 }}>
          <p>测试账号：</p>
          <p>超级管理员: admin / admin123</p>
          <p>猫舍管理员: cattery / cattery123</p>
          <p>普通用户: user / user123</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
