import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Space, Typography, Spin, message, Tag } from 'antd';

const { Title, Text } = Typography;
import { 
  BookOutlined, 
  StarOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { institutionService, type InstitutionResponse } from '../../services/institution.service';
import { userService, type StaffUserResponse } from '../../services/user.service';
import dayjs from 'dayjs';

/**
 * Admin Dashboard Page
 * 
 * Displays:
 * - Statistics: Total Institutions / Total Staff (stat cards)
 * - Recent Institutions: Last 5 created institutions
 * - Recent Staff: Last 5 created staff users
 */
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [staffCount, setStaffCount] = useState(0);
  const [recentInstitutions, setRecentInstitutions] = useState<InstitutionResponse[]>([]);
  const [recentStaff, setRecentStaff] = useState<StaffUserResponse[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics and recent data in parallel
      const [institutionsResult, staffResult] = await Promise.all([
        institutionService.list(0, 5), // Get first 5 for recent list
        userService.list(0, 5), // Get first 5 for recent list
      ]);

      // Set counts
      setStaffCount(staffResult.total);

      // Set recent items (sorted by createdAt desc, which should be default from backend)
      setRecentInstitutions(institutionsResult.items.slice(0, 5));
      setRecentStaff(staffResult.items.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const institutionColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text: string) => text || '-',
    },
    {
      title: 'Province',
      dataIndex: 'province',
      key: 'province',
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ textTransform: 'capitalize' }}>{status}</span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  const staffColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string) => text || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span style={{ textTransform: 'uppercase' }}>{role}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Get user info (this should come from user service in real app)
  const displayName = 'Sarah Administrator';
  const lastLogin = '3/4/2026, 3:08:12 PM';

  return (
    <div style={{ padding: '32px', background: '#ffffff', borderRadius: '8px' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ marginBottom: '8px', color: '#333333', fontSize: '32px', fontWeight: 600 }}>
          Welcome back, {displayName}!
        </Title>
        <Space>
          <Text style={{ fontSize: '16px', color: '#6b7280' }}>
            Last login: {lastLogin}
          </Text>
          <Tag color="default" style={{ borderRadius: '4px' }}>ADMIN</Tag>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: 500 }}>
                  Programs
                </span>
              }
              value={6}
              prefix={<BookOutlined style={{ color: '#1890ff', fontSize: '28px' }} />}
              styles={{
                content: {
                  color: '#333333',
                  fontSize: '36px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: 500 }}>
                  Scholarships
                </span>
              }
              value={6}
              prefix={<StarOutlined style={{ color: '#52c41a', fontSize: '28px' }} />}
              styles={{
                content: {
                  color: '#333333',
                  fontSize: '36px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: 500 }}>
                  Testimonials
                </span>
              }
              value={8}
              prefix={<MessageOutlined style={{ color: '#722ed1', fontSize: '28px' }} />}
              styles={{
                content: {
                  color: '#333333',
                  fontSize: '36px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: 500 }}>
                  Active Staff
                </span>
              }
              value={staffCount}
              prefix={<TeamOutlined style={{ color: '#fa8c16', fontSize: '28px' }} />}
              styles={{
                content: {
                  color: '#333333',
                  fontSize: '36px',
                  fontWeight: 600,
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Data */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ color: '#003366', fontSize: '18px', fontWeight: 600 }}>
                Recent Institutions
              </span>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            styles={{
              header: {
                borderBottom: '1px solid #e5e7eb',
                padding: '16px 24px',
              },
              body: {
                padding: '16px 24px',
              },
            }}
          >
            {recentInstitutions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No institutions found
              </div>
            ) : (
              <Table
                columns={institutionColumns}
                dataSource={recentInstitutions}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ fontSize: '16px' }}
                rowClassName={() => 'dashboard-table-row'}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ color: '#003366', fontSize: '18px', fontWeight: 600 }}>
                Recent Staff
              </span>
            }
            style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            styles={{
              header: {
                borderBottom: '1px solid #e5e7eb',
                padding: '16px 24px',
              },
              body: {
                padding: '16px 24px',
              },
            }}
          >
            {recentStaff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No staff found
              </div>
            ) : (
              <Table
                columns={staffColumns}
                dataSource={recentStaff}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ fontSize: '16px' }}
                rowClassName={() => 'dashboard-table-row'}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
