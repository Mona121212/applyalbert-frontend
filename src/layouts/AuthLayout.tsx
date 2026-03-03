import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Header, Content } = Layout;

/**
 * Auth Layout Component
 * 
 * Shell layout with:
 * - Header (optional, for auth pages)
 * - Outlet (for nested routes like login)
 * 
 * No business logic, just structure
 */
export default function AuthLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: 0,
          background: '#fff',
        }}
      >
        {/* Header content placeholder */}
      </Header>
      
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
