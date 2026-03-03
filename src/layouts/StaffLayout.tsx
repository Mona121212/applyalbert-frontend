import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

/**
 * Staff Layout Component
 * 
 * Shell layout with:
 * - Sider (sidebar)
 * - Header
 * - Outlet (for nested routes)
 * 
 * No business logic, just structure
 */
export default function StaffLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Sider content placeholder */}
      </Sider>
      
      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {/* Header content placeholder */}
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
