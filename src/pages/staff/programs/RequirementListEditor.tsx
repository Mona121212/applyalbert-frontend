import { useState } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Modal, Form, Input, Select, Switch, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  programRequirementService,
  type ProgramRequirementRequest,
  type ProgramRequirementResponse,
} from '../../../services/program-requirement.service';

const { TextArea } = Input;

/**
 * Requirement form schema
 */
const requirementSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  admissionText: z.string().optional(),
  prerequisites: z.string().optional(), // JSON
  studentType: z.string().optional(), // all | domestic | international
  competitiveThreshold: z.string().optional(),
  countryCode: z.string().optional(),
  systemName: z.string().optional(),
  englishProficiency: z.string().optional(), // JSON
  portfolioRequired: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

type RequirementFormData = z.infer<typeof requirementSchema>;

interface RequirementListEditorProps {
  programId: string;
  requirements: ProgramRequirementResponse[];
  onReload: () => void;
}

/**
 * Requirement List Editor Component
 * 
 * Features:
 * - Display list of requirements
 * - Add new requirement
 * - Edit existing requirement
 * - Delete requirement
 * - Calls programRequirementService API
 */
export default function RequirementListEditor({
  programId,
  requirements,
  onReload,
}: RequirementListEditorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRequirement, setEditingRequirement] =
    useState<ProgramRequirementResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      language: '',
      admissionText: '',
      prerequisites: '',
      studentType: 'all',
      competitiveThreshold: '',
      countryCode: '',
      systemName: '',
      englishProficiency: '',
      portfolioRequired: false,
      notes: '',
      status: 'draft',
    },
  });

  /**
   * Handle add button click
   */
  const handleAdd = () => {
    setEditingRequirement(null);
    reset({
      language: '',
      admissionText: '',
      prerequisites: '',
      studentType: 'all',
      competitiveThreshold: '',
      countryCode: '',
      systemName: '',
      englishProficiency: '',
      portfolioRequired: false,
      notes: '',
      status: 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (requirement: ProgramRequirementResponse) => {
    setEditingRequirement(requirement);
    reset({
      language: requirement.language || '',
      admissionText: requirement.admissionText || '',
      prerequisites: requirement.prerequisites || '',
      studentType: requirement.studentType || 'all',
      competitiveThreshold: requirement.competitiveThreshold || '',
      countryCode: requirement.countryCode || '',
      systemName: requirement.systemName || '',
      englishProficiency: requirement.englishProficiency || '',
      portfolioRequired: requirement.portfolioRequired || false,
      notes: requirement.notes || '',
      status: requirement.status || 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: string) => {
    try {
      await programRequirementService.delete(programId, id);
      message.success('Requirement deleted successfully');
      onReload();
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      message.error('Failed to delete requirement');
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RequirementFormData) => {
    setSaving(true);
    try {
      const request: ProgramRequirementRequest = {
        language: data.language,
        admissionText: data.admissionText || undefined,
        prerequisites: data.prerequisites || undefined,
        studentType: data.studentType || undefined,
        competitiveThreshold: data.competitiveThreshold || undefined,
        countryCode: data.countryCode || undefined,
        systemName: data.systemName || undefined,
        englishProficiency: data.englishProficiency || undefined,
        portfolioRequired: data.portfolioRequired,
        notes: data.notes || undefined,
        status: data.status || 'draft',
      };

      if (editingRequirement) {
        await programRequirementService.update(programId, editingRequirement.id, request);
        message.success('Requirement updated successfully');
      } else {
        await programRequirementService.create(programId, request);
        message.success('Requirement created successfully');
      }

      setModalVisible(false);
      onReload();
    } catch (error) {
      console.error('Failed to save requirement:', error);
      message.error(editingRequirement ? 'Failed to update requirement' : 'Failed to create requirement');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Table columns
   */
  const columns: ColumnsType<ProgramRequirementResponse> = [
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: 'Student Type',
      dataIndex: 'studentType',
      key: 'studentType',
      render: (type: string) => type || 'all',
    },
    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      key: 'countryCode',
      render: (code: string) => code || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProgramRequirementResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Requirement"
            description="Are you sure you want to delete this requirement?"
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
        title="Requirements"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Requirement
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requirements}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
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
                <Input placeholder="Enter language (e.g., en, fr)" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Admission Text"
            validateStatus={errors.admissionText ? 'error' : ''}
            help={errors.admissionText?.message}
          >
            <Controller
              name="admissionText"
              control={control}
              render={({ field }) => (
                <TextArea rows={3} placeholder="Enter admission text" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Prerequisites (JSON)"
            validateStatus={errors.prerequisites ? 'error' : ''}
            help={errors.prerequisites?.message}
          >
            <Controller
              name="prerequisites"
              control={control}
              render={({ field }) => (
                <TextArea
                  rows={2}
                  placeholder='Enter prerequisites as JSON'
                  {...field}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Student Type"
            validateStatus={errors.studentType ? 'error' : ''}
            help={errors.studentType?.message}
          >
            <Controller
              name="studentType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select student type">
                  <Select.Option value="all">All</Select.Option>
                  <Select.Option value="domestic">Domestic</Select.Option>
                  <Select.Option value="international">International</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Competitive Threshold"
            validateStatus={errors.competitiveThreshold ? 'error' : ''}
            help={errors.competitiveThreshold?.message}
          >
            <Controller
              name="competitiveThreshold"
              control={control}
              render={({ field }) => (
                <Input placeholder="e.g., 85%, 3.0 GPA" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Country Code (ISO 3166-1 alpha-2)"
            validateStatus={errors.countryCode ? 'error' : ''}
            help={errors.countryCode?.message}
          >
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <Input placeholder="e.g., CA, US, PH" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="System Name"
            validateStatus={errors.systemName ? 'error' : ''}
            help={errors.systemName?.message}
          >
            <Controller
              name="systemName"
              control={control}
              render={({ field }) => (
                <Input placeholder="e.g., Philippine K-12" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="English Proficiency (JSON)"
            validateStatus={errors.englishProficiency ? 'error' : ''}
            help={errors.englishProficiency?.message}
          >
            <Controller
              name="englishProficiency"
              control={control}
              render={({ field }) => (
                <TextArea
                  rows={2}
                  placeholder='Enter English proficiency as JSON (e.g., IELTS/TOEFL)'
                  {...field}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Portfolio Required"
            validateStatus={errors.portfolioRequired ? 'error' : ''}
            help={errors.portfolioRequired?.message}
          >
            <Controller
              name="portfolioRequired"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Notes"
            validateStatus={errors.notes ? 'error' : ''}
            help={errors.notes?.message}
          >
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea rows={2} placeholder="Enter notes" {...field} />
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
                <Select {...field} placeholder="Select status">
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
                {editingRequirement ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
