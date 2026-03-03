import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  programService,
  type ProgramResponse,
} from '../../../services/program.service';

/**
 * Program List Page
 * 
 * Features:
 * - Calls program.service.list() for data
 * - AntD Table with pagination
 * - Filter by status, credential, delivery
 * - Default filter: status != archived
 * - Create, Edit, Delete (logical delete via DELETE API) operations
 * - Note: institutionId is NOT sent - backend extracts from JWT
 */
export default function ProgramListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgramResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [credentialFilter, setCredentialFilter] = useState<string | undefined>(undefined);
  const [deliveryFilter, setDeliveryFilter] = useState<string | undefined>(undefined);

  /**
   * Load programs list
   */
  const loadData = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const result = await programService.list(page, size);
      
      // Filter out archived by default (unless filter is 'archived')
      let filteredItems = result.items;
      if (statusFilter === 'all') {
        filteredItems = result.items.filter((item) => item.status !== 'archived');
      } else if (statusFilter !== 'all') {
        filteredItems = result.items.filter((item) => item.status === statusFilter);
      }

      // Additional filters
      if (credentialFilter) {
        filteredItems = filteredItems.filter((item) => item.credential === credentialFilter);
      }
      if (deliveryFilter) {
        filteredItems = filteredItems.filter((item) => item.delivery === deliveryFilter);
      }

      setData(filteredItems);
      setPagination({
        current: result.page + 1,
        pageSize: result.size,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to load programs:', error);
      message.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0, pagination.pageSize);
  }, [statusFilter, credentialFilter, deliveryFilter]);

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
    navigate('/staff/programs/new');
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (id: string) => {
    navigate(`/staff/programs/${id}`);
  };

  /**
   * Handle delete (logical delete via DELETE API)
   * Backend will change status to archived
   */
  const handleDelete = async (id: string) => {
    try {
      await programService.delete(id);
      message.success('Program archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete program:', error);
      message.error('Failed to archive program');
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'green';
      case 'in_review':
        return 'orange';
      case 'approved':
        return 'blue';
      case 'draft':
        return 'gray';
      case 'archived':
        return 'red';
      case 'scheduled':
        return 'purple';
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
   * Get unique values for filters
   */
  const getUniqueValues = (key: keyof ProgramResponse) => {
    const values = new Set<string>();
    data.forEach((item) => {
      const value = item[key];
      if (value && typeof value === 'string') {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  /**
   * Table columns
   */
  const columns: ColumnsType<ProgramResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Credential',
      dataIndex: 'credential',
      key: 'credential',
    },
    {
      title: 'Delivery',
      dataIndex: 'delivery',
      key: 'delivery',
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
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: formatDate,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: ProgramResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Archive Program"
            description="Are you sure you want to archive this program? This will change the status to archived."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
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
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: 'All (exclude archived)', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'In Review', value: 'in_review' },
              { label: 'Approved', value: 'approved' },
              { label: 'Published', value: 'published' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
          <Select
            placeholder="Filter by Credential"
            value={credentialFilter}
            onChange={setCredentialFilter}
            allowClear
            style={{ width: 150 }}
            options={getUniqueValues('credential').map((val) => ({
              label: val,
              value: val,
            }))}
          />
          <Select
            placeholder="Filter by Delivery"
            value={deliveryFilter}
            onChange={setDeliveryFilter}
            allowClear
            style={{ width: 150 }}
            options={getUniqueValues('delivery').map((val) => ({
              label: val,
              value: val,
            }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Program
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} programs`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 10
          );
        }}
      />
    </div>
  );
}
