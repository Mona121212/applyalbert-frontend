import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  scholarshipService,
  type ScholarshipResponse,
} from '../../../services/scholarship.service';
import ScholarshipFormDrawer from './ScholarshipFormDrawer';

/**
 * Scholarship List Page
 * 
 * Features:
 * - Calls scholarship.service.list() for data
 * - AntD Table with pagination
 * - Default filter: status != archived
 * - Create, Edit, Delete (logical delete: status = archived) operations
 */
export default function ScholarshipListPage() {
  const [data, setData] = useState<ScholarshipResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingScholarship, setEditingScholarship] =
    useState<ScholarshipResponse | null>(null);

  /**
   * Load scholarships list
   */
  const loadData = async (page: number = 0, size: number = 20) => {
    setLoading(true);
    try {
      const result = await scholarshipService.list(page, size);
      
      // Filter out archived by default (unless filter is 'archived')
      let filteredItems = result.items;
      if (statusFilter === 'all') {
        filteredItems = result.items.filter((item) => item.status !== 'archived');
      } else if (statusFilter !== 'all') {
        filteredItems = result.items.filter((item) => item.status === statusFilter);
      }

      setData(filteredItems);
      setPagination({
        current: result.page + 1,
        pageSize: result.size,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to load scholarships:', error);
      message.error('Failed to load scholarships');
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
    loadData(page - 1, pageSize);
  };

  /**
   * Handle create button click
   */
  const handleCreate = () => {
    setEditingScholarship(null);
    setDrawerVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: ScholarshipResponse) => {
    setEditingScholarship(record);
    setDrawerVisible(true);
  };

  /**
   * Handle delete (logical delete: status = archived)
   */
  const handleDelete = async (id: string) => {
    try {
      await scholarshipService.delete(id);
      message.success('Scholarship archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to archive scholarship:', error);
      message.error('Failed to archive scholarship');
    }
  };

  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingScholarship(null);
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
   * Format currency
   */
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
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
  const columns: ColumnsType<ScholarshipResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: formatCurrency,
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: formatDate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ScholarshipResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Archive Scholarship"
            description="Are you sure you want to archive this scholarship?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Archive
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: 'All (exclude archived)', value: 'all' },
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Scholarship
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
          showTotal: (total) => `Total ${total} scholarships`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 20
          );
        }}
      />

      <ScholarshipFormDrawer
        visible={drawerVisible}
        scholarship={editingScholarship}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
