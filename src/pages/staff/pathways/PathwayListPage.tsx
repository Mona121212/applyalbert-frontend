import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  pathwayService,
  type PathwayResponse,
} from '../../../services/pathway.service';
import PathwayFormDrawer from './PathwayFormDrawer';

/**
 * Pathway List Page
 * 
 * Features:
 * - Calls pathwayService.list() for data
 * - AntD Table with pagination
 * - Default filter: status != archived
 * - Create, Edit, Delete (logical delete: status = archived) operations
 */
export default function PathwayListPage() {
  const [data, setData] = useState<PathwayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPathway, setEditingPathway] =
    useState<PathwayResponse | null>(null);

  /**
   * Load pathways list
   */
  const loadData = async (page: number = 0, size: number = 20) => {
    setLoading(true);
    try {
      const result = await pathwayService.list(page, size);
      
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
      console.error('Failed to load pathways:', error);
      message.error('Failed to load pathways');
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
    setEditingPathway(null);
    setDrawerVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: PathwayResponse) => {
    setEditingPathway(record);
    setDrawerVisible(true);
  };

  /**
   * Handle delete (logical delete: status = archived)
   */
  const handleDelete = async (id: string) => {
    try {
      await pathwayService.delete(id);
      message.success('Pathway archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to archive pathway:', error);
      message.error('Failed to archive pathway');
    }
  };

  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingPathway(null);
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
  const columns: ColumnsType<PathwayResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (_: any, record: PathwayResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Archive Pathway"
            description="Are you sure you want to archive this pathway?"
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
          New Pathway
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
          showTotal: (total) => `Total ${total} pathways`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 20
          );
        }}
      />

      <PathwayFormDrawer
        visible={drawerVisible}
        pathway={editingPathway}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
