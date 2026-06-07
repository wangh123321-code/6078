import React from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import {
  DashboardOutlined,
  CatOutlined,
  HeartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import useUserStore from '../store/userStore.js'
import { isSuperAdmin, isCatteryAdmin } from '../utils/auth.js'

const { Header, Sider, Content } = Layout

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: '血统查询',
      onClick: () => navigate('/search'),
    },
    {
      key: '/cats',
      icon: <CatOutlined />,
      label: '猫咪管理',
    },
    {
      key: '/breedings',
      icon: <HeartOutlined />,
      label: '繁育管理',
    },
    {
      key: '/certificates',
      icon: <FileTextOutlined />,
      label: '证书管理',
    },
  ]

  if (isSuperAdmin()) {
    menuItems.push({
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    })
  }

  const userMenu = {
    items: [
      {
        key: '1',
        label: user?.realName || user?.username,
        disabled: true,
      },
      {
        key: '2',
        label: user?.role || 'USER',
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo">
          <CatOutlined style={{ marginRight: 8 }} />
          纯种猫血统管理系统
        </div>
        <div className="user-info">
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.realName || user?.username}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => {
              if (key !== '/search') {
                navigate(key)
              }
            }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default AppLayout
