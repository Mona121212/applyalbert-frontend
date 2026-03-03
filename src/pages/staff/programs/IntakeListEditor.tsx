import { useState } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Modal, Form, Input, Select, Switch, InputNumber, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs, { type Dayjs } from 'dayjs';
import {
  programIntakeService,
  type ProgramIntakeRequest,
  type ProgramIntakeResponse,
} from '../../../services/program-intake.service';

/**
 * Intake form schema
 */
const intakeSchema = z.object({
  intakeTerm: z.string().optional(),
  startDate: z.string().optional(), // LocalDate (YYYY-MM-DD)
  applicationDeadline: z.string().optional(), // LocalDate (YYYY-MM-DD)
  seatsAvailable: z.number().int().min(0).optional(),
  isOpen: z.boolean().optional(),
  status: z.string().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

interface IntakeListEditorProps {
  programId: string;
  intakes: ProgramIntakeResponse[];
  onReload: () => void;
}

/**
 * Intake List Editor Component
 * 
 * Features:
 * - Display list of intakes
 * - Add new intake
 * - Edit existing intake
 * - Delete intake
 * - Calls programIntakeService API
 */
export default function IntakeListEditor({
  programId,
  intakes,
  onReload,
}: IntakeListEditorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIntake, setEditingIntake] = useState<ProgramIntakeResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      intakeTerm: '',
      startDate: undefined,
      applicationDeadline: undefined,
      seatsAvailable: undefined,
      isOpen: false,
      status: 'draft',
    },
  });

  /**
   * Handle add button click
   */
  const handleAdd = () => {
    setEditingIntake(null);
    reset({
      intakeTerm: '',
      startDate: undefined,
      applicationDeadline: undefined,
      seatsAvailable: undefined,
      isOpen: false,
      status: 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (intake: ProgramIntakeResponse) => {
    setEditingIntake(intake);
    reset({
      intakeTerm: intake.intakeTerm || '',
      startDate: intake.startDate || undefined,
      applicationDeadline: intake.applicationDeadline || undefined,
      seatsAvailable: intake.seatsAvailable,
      isOpen: intake.isOpen || false,
      status: intake.status || 'draft',
    });
    setModalVisible(true);
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: string) => {
    try {
      await programIntakeService.delete(programId, id);
      message.success('Intake deleted successfully');
      onReload();
    } catch (error) {
      console.error('Failed to delete intake:', error);
      message.error('Failed to delete intake');
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: IntakeFormData) => {
    setSaving(true);
    try {
      const request: ProgramIntakeRequest = {
        intakeTerm: data.intakeTerm || undefined,
        startDate: data.startDate || undefined,
        applicationDeadline: data.applicationDeadline || undefined,
        seatsAvailable: data.seatsAvailable,
        isOpen: data.isOpen,
        status: data.status || 'draft',
      };

      if (editingIntake) {
        await programIntakeService.update(programId, editingIntake.id, request);
        message.success('Intake updated successfully');
      } else {
        await programIntakeService.create(programId, request);
        message.success('Intake created successfully');
      }

      setModalVisible(false);
      onReload();
    } catch (error) {
      console.error('Failed to save intake:', error);
      message.error(editingIntake ? 'Failed to update intake' : 'Failed to create intake');
    } finally {
      setSaving(false);
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
  const columns: ColumnsType<ProgramIntakeResponse> = [
    {
      title: 'Intake Term',
      dataIndex: 'intakeTerm',
      key: 'intakeTerm',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: formatDate,
    },
    {
      title: 'Application Deadline',
      dataIndex: 'applicationDeadline',
      key: 'applicationDeadline',
      render: formatDate,
    },
    {
      title: 'Seats Available',
      dataIndex: 'seatsAvailable',
      key: 'seatsAvailable',
    },
    {
      title: 'Is Open',
      dataIndex: 'isOpen',
      key: 'isOpen',
      render: (isOpen: boolean) => (isOpen ? 'Yes' : 'No'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProgramIntakeResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Intake"
            description="Are you sure you want to delete this intake?"
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
        title="Intakes"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Intake
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={intakes}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingIntake ? 'Edit Intake' : 'Add Intake'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item
            label="Intake Term"
            validateStatus={errors.intakeTerm ? 'error' : ''}
            help={errors.intakeTerm?.message}
          >
            <Controller
              name="intakeTerm"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter intake term" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Start Date"
            validateStatus={errors.startDate ? 'error' : ''}
            help={errors.startDate?.message}
          >
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date: Dayjs | null) => {
                    field.onChange(date ? date.format('YYYY-MM-DD') : undefined);
                  }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Application Deadline"
            validateStatus={errors.applicationDeadline ? 'error' : ''}
            help={errors.applicationDeadline?.message}
          >
            <Controller
              name="applicationDeadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date: Dayjs | null) => {
                    field.onChange(date ? date.format('YYYY-MM-DD') : undefined);
                  }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Seats Available"
            validateStatus={errors.seatsAvailable ? 'error' : ''}
            help={errors.seatsAvailable?.message}
          >
            <Controller
              name="seatsAvailable"
              control={control}
              render={({ field }) => (
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter seats available"
                  min={0}
                  {...field}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? undefined)}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Is Open"
            validateStatus={errors.isOpen ? 'error' : ''}
            help={errors.isOpen?.message}
          >
            <Controller
              name="isOpen"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
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
                {editingIntake ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
