import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  supportServiceService,
  type SupportServiceResponse,
} from '../../../services/support-service.service';
import SupportServiceFormDrawer from './SupportServiceFormDrawer';

/**
 * Support Service List Page
 * 
 * Features:
 * - Calls supportServiceService.list() for data
 * - AntD Table with pagination
 * - Default filter: status != archived
 * - Create, Edit, Delete (logical delete: status = archived) operations
 */
export default function SupportServiceListPage() {
  const [data, setData] = useState<SupportServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingService, setEditingService] =
    useState<SupportServiceResponse | null>(null);

  /**
   * Load support services list
   */
  const loadData = async (page: number = 0, size: number = 20) => {
    setLoading(true);
    try {
      const result = await supportServiceService.list(page, size);
      
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
      console.error('Failed to load support services:', error);
      message.error('Failed to load support services');
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
    setEditingService(null);
    setDrawerVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: SupportServiceResponse) => {
    setEditingService(record);
    setDrawerVisible(true);
  };

  /**
   * Handle delete (logical delete: status = archived)
   */
  const handleDelete = async (id: string) => {
    try {
      await supportServiceService.delete(id);
      message.success('Support service archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to archive support service:', error);
      message.error('Failed to archive support service');
    }
  };

  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingService(null);
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
  const columns: ColumnsType<SupportServiceResponse> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
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
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: formatDate,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SupportServiceResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Archive Support Service"
            description="Are you sure you want to archive this support service?"
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
          New Support Service
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
          showTotal: (total) => `Total ${total} support services`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 20
          );
        }}
      />

      <SupportServiceFormDrawer
        visible={drawerVisible}
        service={editingService}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
