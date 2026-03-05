import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
import {
  institutionService,
  type InstitutionResponse,
} from '../../../services/institution.service';
import InstitutionFormDrawer from './InstitutionFormDrawer';

/**
 * Institution List Page
 * 
 * Features:
 * - Calls institution.service.list() for data
 * - AntD Table with pagination
 * - Default filter: status != archived
 * - Create, Edit, Delete (logical delete: status = archived) operations
 */
export default function InstitutionListPage() {
  const [data, setData] = useState<InstitutionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingInstitution, setEditingInstitution] =
    useState<InstitutionResponse | null>(null);

  /**
   * Load institutions list
   */
  const loadData = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const result = await institutionService.list(page, size);
      
      // Filter out archived by default (unless filter is 'archived')
      let filteredItems = result.items;
      if (statusFilter === 'all') {
        filteredItems = result.items.filter((item) => item.status !== 'archived');
      } else if (statusFilter !== 'all') {
        filteredItems = result.items.filter((item) => item.status === statusFilter);
      }

      setData(filteredItems);
      setPagination({
        current: result.page + 1, // Convert 0-based to 1-based
        pageSize: result.size,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to load institutions:', error);
      message.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0, pagination.pageSize);
  }, [statusFilter]);

  /**
   * Handle table pagination change
   */
  const handleTableChange = (page: number, pageSize: number) => {
    loadData(page - 1, pageSize); // Convert 1-based to 0-based
  };

  /**
   * Handle create button click
   */
  const handleCreate = () => {
    setEditingInstitution(null);
    setDrawerVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: InstitutionResponse) => {
    setEditingInstitution(record);
    setDrawerVisible(true);
  };

  /**
   * Handle delete (logical delete: status = archived)
   */
  const handleDelete = async (id: string) => {
    try {
      await institutionService.update(id, { status: 'archived' });
      message.success('Institution archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to archive institution:', error);
      message.error('Failed to archive institution');
    }
  };

  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingInstitution(null);
  };

  /**
   * Handle drawer success (create/update)
   */
  const handleDrawerSuccess = () => {
    handleDrawerClose();
    loadData(pagination.current - 1, pagination.pageSize);
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'green';
      case 'draft':
        return 'gray';
      case 'archived':
        return 'red';
      default:
        return 'default';
    }
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
  const columns: ColumnsType<InstitutionResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: false,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Province',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = getStatusColor(status);
        return (
          <Tag 
            color={color}
            style={{ 
              borderRadius: '4px',
              border: 'none',
            }}
          >
            {status?.toUpperCase()}
          </Tag>
        );
      },
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
      render: (_: any, record: InstitutionResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff', fontSize: '16px' }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Archive Institution"
            description="Are you sure you want to archive this institution?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              style={{ color: '#f5222d', fontSize: '16px' }}
            >
              Archive
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '32px', background: '#ffffff', borderRadius: '8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px', color: '#333333', fontSize: '28px', fontWeight: 600 }}>
            Institution Management
          </Title>
          <Text style={{ fontSize: '16px', color: '#6b7280' }}>
            Add and manage institutions
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
          Create Institution
        </Button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '16px' }}>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          options={[
            { label: 'All (exclude archived)', value: 'all' },
            { label: 'Published', value: 'published' },
            { label: 'Draft', value: 'draft' },
            { label: 'Archived', value: 'archived' },
          ]}
        />
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
          showTotal: (total) => `Total ${total} institutions`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 10
          );
        }}
        style={{
          background: '#ffffff',
          fontSize: '16px',
        }}
        rowClassName={() => 'dashboard-table-row'}
      />

      <InstitutionFormDrawer
        visible={drawerVisible}
        institution={editingInstitution}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
