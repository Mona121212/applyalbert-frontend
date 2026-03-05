import { useState, useEffect } from 'react';
import { Card, Button, Space, Select, Tag, message, Row, Col, Avatar, Typography, Divider } from 'antd';
import { PlusOutlined, MailOutlined, CalendarOutlined, UserOutlined, StopOutlined } from '@ant-design/icons';
import {
  userService,
  type StaffUserResponse,
} from '../../../services/user.service';
import { institutionService, type InstitutionResponse } from '../../../services/institution.service';
import StaffFormModal from './StaffFormModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * Staff List Page
 * 
 * Features:
 * - Calls user.service.list() for data
 * - AntD Table with pagination
 * - Filter by institution_id and role
 * - Create, Edit, Toggle isActive (logical delete) operations
 */
export default function StaffListPage() {
  const [data, setData] = useState<StaffUserResponse[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [institutionFilter, setInstitutionFilter] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserResponse | null>(null);

  /**
   * Load institutions for dropdown
   */
  const loadInstitutions = async () => {
    try {
      const result = await institutionService.list(0, 1000); // Get all institutions
      setInstitutions(result.items.filter(item => item.status !== 'archived'));
    } catch (error) {
      console.error('Failed to load institutions:', error);
    }
  };

  /**
   * Load users list
   */
  const loadData = async (page: number = 0, size: number = 20) => {
    setLoading(true);
    try {
      const result = await userService.list(
        page,
        size,
        institutionFilter,
        roleFilter
      );

      // Filter by isActive = true by default
      const filteredItems = result.items.filter((item) => item.isActive);

      setData(filteredItems);
      setPagination({
        current: result.page + 1,
        pageSize: result.size,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadData(0, pagination.pageSize);
  }, [institutionFilter, roleFilter]);

  /**
   * Handle table pagination change
   */
  const handleTableChange = (page: number, pageSize: number) => {
    loadData(page - 1, pageSize);
  };

  /**
   * Handle create button click
   */
  const handleCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: StaffUserResponse) => {
    setEditingUser(record);
    setModalVisible(true);
  };

  /**
   * Handle toggle isActive (logical delete)
   */
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await userService.update(id, { isActive: !currentActive });
      message.success(`User ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      message.error('Failed to toggle user status');
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingUser(null);
  };

  /**
   * Handle modal success (create/update)
   */
  const handleModalSuccess = () => {
    handleModalClose();
    loadData(pagination.current - 1, pagination.pageSize);
  };

  /**
   * Get institution name by ID
   */
  const getInstitutionName = (institutionId?: string) => {
    if (!institutionId) return '-';
    const institution = institutions.find((inst) => inst.id === institutionId);
    return institution?.name || institutionId;
  };

  /**
   * Format date
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('M/D/YYYY');
  };

  /**
   * Format date time
   */
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('M/D/YYYY, h:mm:ss A');
  };

  /**
   * Get initials for avatar
   */
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ padding: '32px', background: '#ffffff', borderRadius: '8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px', color: '#333333', fontSize: '28px', fontWeight: 600 }}>
            Staff Management
          </Title>
          <Text style={{ fontSize: '16px', color: '#6b7280' }}>
            Add and manage admin and staff users
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          style={{
            background: '#1890ff',
            borderColor: '#1890ff',
            height: '40px',
            fontSize: '16px',
          }}
        >
          + Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Select
            placeholder="Filter by Institution"
            value={institutionFilter}
            onChange={setInstitutionFilter}
            allowClear
            style={{ width: 200 }}
            options={institutions.map((inst) => ({
              label: inst.name,
              value: inst.id,
            }))}
          />
          <Select
            placeholder="Filter by Role"
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: 'STAFF', value: 'STAFF' },
              { label: 'ADMIN', value: 'ADMIN' },
            ]}
          />
        </Space>
      </div>

      {/* Staff Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading...
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {data.map((user) => (
            <Col xs={24} sm={12} lg={12} key={user.id}>
              <Card
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Avatar */}
                  <Avatar
                    size={64}
                    style={{
                      backgroundColor: '#722ed1',
                      color: '#ffffff',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(user.displayName || user.email)}
                  </Avatar>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Title level={4} style={{ marginBottom: '8px', color: '#333333', fontSize: '18px', fontWeight: 600 }}>
                        {user.displayName || user.email}
                      </Title>
                      <Space>
                        <Tag 
                          color={user.role === 'ADMIN' ? 'default' : 'default'}
                          style={{ 
                            borderRadius: '4px',
                            backgroundColor: user.role === 'ADMIN' ? '#000000' : '#f3f4f6',
                            color: user.role === 'ADMIN' ? '#ffffff' : '#333333',
                            border: 'none',
                            fontSize: '14px',
                          }}
                        >
                          {user.role?.toLowerCase() || 'staff'}
                        </Tag>
                        {user.isActive && (
                          <Tag 
                            color="success"
                            style={{ 
                              borderRadius: '4px',
                              backgroundColor: '#52c41a',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '14px',
                            }}
                          >
                            Active
                          </Tag>
                        )}
                      </Space>
                    </div>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MailOutlined style={{ color: '#6b7280', fontSize: '16px' }} />
                        <Text style={{ fontSize: '15px', color: '#6b7280' }}>
                          {user.email}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarOutlined style={{ color: '#6b7280', fontSize: '16px' }} />
                        <Text style={{ fontSize: '15px', color: '#6b7280' }}>
                          Created: {formatDate(user.createdAt)}
                        </Text>
                      </div>
                      {user.updatedAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserOutlined style={{ color: '#6b7280', fontSize: '16px' }} />
                          <Text style={{ fontSize: '15px', color: '#6b7280' }}>
                            Last login: {formatDateTime(user.updatedAt)}
                          </Text>
                        </div>
                      )}
                    </Space>

                    {!user.isActive && (
                      <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <Button
                          danger
                          icon={<StopOutlined />}
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          style={{
                            backgroundColor: '#f5222d',
                            borderColor: '#f5222d',
                            color: '#ffffff',
                            fontSize: '16px',
                          }}
                        >
                          Deactivate
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {data.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
          No staff members found
        </div>
      )}

      <StaffFormModal
        visible={modalVisible}
        user={editingUser}
        institutions={institutions}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
