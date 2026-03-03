import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  userService,
  type StaffUserResponse,
} from '../../../services/user.service';
import { institutionService, type InstitutionResponse } from '../../../services/institution.service';
import StaffFormModal from './StaffFormModal';

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
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Table columns
   */
  const columns: ColumnsType<StaffUserResponse> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Institution',
      key: 'institution',
      render: (_: any, record: StaffUserResponse) => (
        getInstitutionName(record.institutionId)
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: StaffUserResponse) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id, isActive)}
        />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: formatDate,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StaffUserResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Staff
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 20
          );
        }}
      />

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
