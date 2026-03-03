import { Layout, Menu, Button, Space, Typography, Dropdown, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  LogoutOutlined,
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
  const { role, userId } = useAuthStore();

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

  // User menu dropdown items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Get selected menu key from current path
  const selectedKeys = [location.pathname];

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
          background: '#003366', // Alberta Blue
        }}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 600,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: '#001f3d', // Darker blue for header
          }}
        >
          ApplyAlberta
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: '#003366',
            paddingTop: '16px',
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 18, color: '#003366' }}>
              Admin Panel
            </Text>
          </div>

          <Space size="middle">
            <Text type="secondary" style={{ fontSize: 14 }}>
              Role: <Text strong style={{ color: '#003366' }}>{role || 'N/A'}</Text>
            </Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button 
                type="text" 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  height: 'auto',
                  padding: '4px 12px',
                }}
              >
                <Space>
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small"
                    style={{ background: '#003366' }}
                  />
                  <Text style={{ color: '#374151' }}>Admin</Text>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '32px',
            minHeight: 280,
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
