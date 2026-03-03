import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  curriculumService,
  type CurriculumRequest,
  type CurriculumResponse,
} from '../../../services/curriculum.service';

const { TextArea } = Input;

/**
 * Curriculum form schema using Zod
 */
const curriculumSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  structure: z.string().min(1, 'Structure is required'), // JSON
  status: z.string().optional(),
});

type CurriculumFormData = z.infer<typeof curriculumSchema>;

interface CurriculumEditorProps {
  programId: string;
  onReload: () => void;
}

/**
 * Curriculum Editor Component
 * 
 * Features:
 * - Display list of curricula (one per language)
 * - Add new curriculum (for a language)
 * - Edit existing curriculum
 * - Delete curriculum
 * - Calls curriculumService API
 * - Note: Unique constraint on (program_id, language)
 */
export default function CurriculumEditor({
  programId,
  onReload,
}: CurriculumEditorProps) {
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCurriculum, setEditingCurriculum] =
    useState<CurriculumResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurriculumFormData>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: {
      language: '',
      structure: '',
      status: 'draft',
    },
  });

  /**
   * Load curricula list
   */
  useEffect(() => {
    loadCurricula();
  }, [programId]);

  const loadCurricula = async () => {
    setLoading(true);
    try {
      const data = await curriculumService.list(programId);
      setCurricula(data);
    } catch (error) {
      console.error('Failed to load curricula:', error);
      message.error('Failed to load curricula');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle add button click
   */
  const handleAdd = () => {
    setEditingCurriculum(null);
    reset({
      language: '',
      structure: '',
      status: 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (curriculum: CurriculumResponse) => {
    setEditingCurriculum(curriculum);
    reset({
      language: curriculum.language || '',
      structure: curriculum.structure || '',
      status: curriculum.status || 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: string) => {
    try {
      await curriculumService.delete(programId, id);
      message.success('Curriculum deleted successfully');
      loadCurricula();
      onReload();
    } catch (error) {
      console.error('Failed to delete curriculum:', error);
      message.error('Failed to delete curriculum');
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CurriculumFormData) => {
    setSaving(true);
    try {
      const request: CurriculumRequest = {
        language: data.language,
        structure: data.structure,
        status: data.status || 'draft',
      };

      if (editingCurriculum) {
        await curriculumService.update(programId, editingCurriculum.id, request);
        message.success('Curriculum updated successfully');
      } else {
        await curriculumService.create(programId, request);
        message.success('Curriculum created successfully');
      }

      setModalVisible(false);
      loadCurricula();
      onReload();
    } catch (error) {
      console.error('Failed to save curriculum:', error);
      message.error(
        editingCurriculum
          ? 'Failed to update curriculum'
          : 'Failed to create curriculum'
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Table columns
   */
  const columns: ColumnsType<CurriculumResponse> = [
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CurriculumResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Curriculum"
            description="Are you sure you want to delete this curriculum?"
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
    <>
      <Card
        title="Curricula"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Curriculum
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={curricula}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingCurriculum ? 'Edit Curriculum' : 'Add Curriculum'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item
            label="Language"
            required
            validateStatus={errors.language ? 'error' : ''}
            help={errors.language?.message}
          >
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Enter language code (e.g., en, fr)"
                  {...field}
                  disabled={!!editingCurriculum}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Structure (JSON)"
            required
            validateStatus={errors.structure ? 'error' : ''}
            help={errors.structure?.message}
          >
            <Controller
              name="structure"
              control={control}
              render={({ field }) => (
                <TextArea
                  rows={10}
                  placeholder='Enter curriculum structure as JSON'
                  {...field}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select status" style={{ width: '100%' }}>
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                  <Select.Option value="archived">Archived</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSubmit(onSubmit)}
              >
                {editingCurriculum ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
