import { useState, useEffect } from 'react';
import { Table, Button, Space, Select, Tag, Popconfirm, message, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  testimonialService,
  type TestimonialResponse,
} from '../../../services/testimonial.service';
import TestimonialFormDrawer from './TestimonialFormDrawer';

/**
 * Testimonial List Page
 * 
 * Features:
 * - Calls testimonialService.list() for data
 * - AntD Table with pagination
 * - Default filter: status != archived
 * - Create, Edit, Publish, Unpublish, Delete (logical delete: status = archived) operations
 */
export default function TestimonialListPage() {
  const [data, setData] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialResponse | null>(null);

  /**
   * Load testimonials list
   */
  const loadData = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const result = await testimonialService.list(page, size, statusFilter);
      
      // Filter out archived by default (unless filter is 'archived')
      let filteredItems = result.items;
      if (!statusFilter || statusFilter === 'all') {
        filteredItems = result.items.filter((item) => item.status !== 'archived');
      } else if (statusFilter === 'archived') {
        filteredItems = result.items.filter((item) => item.status === 'archived');
      } else {
        filteredItems = result.items.filter((item) => item.status === statusFilter);
      }

      setData(filteredItems);
      setPagination({
        current: result.page + 1,
        pageSize: result.size,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      message.error('Failed to load testimonials');
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
    setEditingTestimonial(null);
    setDrawerVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (record: TestimonialResponse) => {
    setEditingTestimonial(record);
    setDrawerVisible(true);
  };

  /**
   * Handle publish
   */
  const handlePublish = async (id: string) => {
    try {
      await testimonialService.publish(id);
      message.success('Testimonial published successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to publish testimonial:', error);
      message.error('Failed to publish testimonial');
    }
  };

  /**
   * Handle unpublish
   */
  const handleUnpublish = async (id: string) => {
    try {
      await testimonialService.unpublish(id);
      message.success('Testimonial unpublished successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to unpublish testimonial:', error);
      message.error('Failed to unpublish testimonial');
    }
  };

  /**
   * Handle delete (logical delete: status = archived)
   */
  const handleDelete = async (id: string) => {
    try {
      await testimonialService.delete(id);
      message.success('Testimonial archived successfully');
      loadData(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Failed to archive testimonial:', error);
      message.error('Failed to archive testimonial');
    }
  };

  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingTestimonial(null);
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
   * Table columns
   */
  const columns: ColumnsType<TestimonialResponse> = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled value={rating} />,
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
      render: (_: any, record: TestimonialResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === 'draft' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handlePublish(record.id)}
            >
              Publish
            </Button>
          )}
          {record.status === 'published' && (
            <Button
              type="link"
              icon={<CloseOutlined />}
              onClick={() => handleUnpublish(record.id)}
            >
              Unpublish
            </Button>
          )}
          <Popconfirm
            title="Archive Testimonial"
            description="Are you sure you want to archive this testimonial?"
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
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
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
          New Testimonial
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
          showTotal: (total) => `Total ${total} testimonials`,
        }}
        onChange={(paginationConfig) => {
          handleTableChange(
            paginationConfig.current || 1,
            paginationConfig.pageSize || 10
          );
        }}
      />

      <TestimonialFormDrawer
        visible={drawerVisible}
        testimonial={editingTestimonial}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
