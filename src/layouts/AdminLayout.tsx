import { Layout, Menu, Button, Space, Typography, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * Admin Layout Component
 * 
 * Features:
 * - Sider: Navigation menu (Dashboard, Institutions, Staff)
 * - Header: User info and logout button
 * - Content: Outlet for nested routes
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuthStore();

  // Menu items
  const menuItems: MenuProps['items'] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/institutions',
      icon: <BankOutlined />,
      label: 'Institutions',
    },
    {
      key: '/admin/staff',
      icon: <UserOutlined />,
      label: 'Staff',
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      await authService.logout(refreshToken || undefined);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      useAuthStore.getState().logout();
      navigate('/login', { replace: true });
    }
  };

  // Get selected menu key from current path
  const selectedKeys = [location.pathname];

  // Get user info (this should come from user service in real app)
  const userEmail = 'admin@applyalberta.ca';
  const displayName = 'Sarah Administrator';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Sider
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        }}
        theme="light"
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: '#ffffff',
            paddingTop: '16px',
          }}
          styles={{
            item: {
              margin: '4px 8px',
              borderRadius: '6px',
              fontSize: '16px',
            },
            itemSelected: {
              backgroundColor: '#1890ff',
              color: '#ffffff',
              fontSize: '16px',
            },
            itemActive: {
              backgroundColor: '#e6f7ff',
              fontSize: '16px',
            },
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: 240, background: '#f5f5f5' }}>
        <Header
          style={{
            padding: '0 32px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderBottom: '1px solid #e5e7eb',
            height: 64,
          }}
        >
          <div>
            <Space>
              <SettingOutlined style={{ fontSize: 20, color: '#333333' }} />
              <div>
                <Text strong style={{ fontSize: 18, color: '#333333', display: 'block' }}>
                  Admin Dashboard
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', display: 'block' }}>
                  Apply Alberta CMS
                </Text>
              </div>
            </Space>
          </div>

          <Space size="middle">
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Text strong style={{ fontSize: 16, color: '#333333' }}>
                  {displayName}
                </Text>
                <Tag color="default" style={{ margin: 0, borderRadius: '4px', fontSize: '14px' }}>
                  admin
                </Tag>
              </Space>
              <div>
                <Text style={{ fontSize: 14, color: '#6b7280', display: 'block' }}>
                  {userEmail}
                </Text>
              </div>
            </div>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                height: 'auto',
                padding: '4px 12px',
                color: '#333333',
                fontSize: '16px',
              }}
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 0,
            minHeight: 280,
            background: 'transparent',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
