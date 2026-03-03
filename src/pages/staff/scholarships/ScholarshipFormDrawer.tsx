import { useEffect } from 'react';
import { Drawer, Form, Input, Button, InputNumber, DatePicker, Select, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs, { type Dayjs } from 'dayjs';
import {
  scholarshipService,
  type ScholarshipRequest,
  type ScholarshipResponse,
} from '../../../services/scholarship.service';

const { TextArea } = Input;

/**
 * Scholarship form schema using Zod
 * Matches ScholarshipRequest.java validation rules
 */
const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(512, 'Name must be less than 512 characters'),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  deadline: z.string().optional(),
  eligibility: z.string().max(2048, 'Eligibility must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const updateSchema = z.object({
  name: z.string().max(512, 'Name must be less than 512 characters').optional(),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  deadline: z.string().optional(),
  eligibility: z.string().max(2048, 'Eligibility must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface ScholarshipFormDrawerProps {
  visible: boolean;
  scholarship: ScholarshipResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Scholarship Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields match ScholarshipRequest.java exactly:
 * - name* (required for create, max 512)
 * - description (max 4096)
 * - amount (BigDecimal)
 * - deadline (LocalDate)
 * - eligibility (max 2048)
 * - status (draft | published | archived)
 * - comment (optional, max 500)
 */
export default function ScholarshipFormDrawer({
  visible,
  scholarship,
  onClose,
  onSuccess,
}: ScholarshipFormDrawerProps) {
  const isEdit = !!scholarship;
  const schema = isEdit ? updateSchema : createSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      amount: undefined,
      deadline: undefined,
      eligibility: '',
      status: 'draft',
      comment: '',
    },
  });

  // Reset form when scholarship changes
  useEffect(() => {
    if (visible) {
      if (scholarship) {
        // Edit mode: populate form with existing data
        reset({
          name: scholarship.name || '',
          description: scholarship.description || '',
          amount: scholarship.amount,
          deadline: scholarship.deadline || undefined,
          eligibility: scholarship.eligibility || '',
          status: scholarship.status || 'draft',
          comment: scholarship.comment || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          name: '',
          description: '',
          amount: undefined,
          deadline: undefined,
          eligibility: '',
          status: 'draft',
          comment: '',
        });
      }
    }
  }, [visible, scholarship, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      const request: ScholarshipRequest = {};
      if (data.name) request.name = data.name;
      if (data.description) request.description = data.description;
      if (data.amount !== undefined) request.amount = data.amount;
      if (data.deadline) request.deadline = data.deadline;
      if (data.eligibility) request.eligibility = data.eligibility;
      if (data.status) request.status = data.status;
      if (data.comment) request.comment = data.comment;

      if (isEdit && scholarship) {
        await scholarshipService.update(scholarship.id, request);
        message.success('Scholarship updated successfully');
      } else {
        await scholarshipService.create(request as ScholarshipRequest);
        message.success('Scholarship created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save scholarship:', error);
      message.error(
        isEdit
          ? 'Failed to update scholarship'
          : 'Failed to create scholarship'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Scholarship' : 'Create Scholarship'}
      width={720}
      open={visible}
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item
          label="Name"
          required={!isEdit}
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter scholarship name" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={4}
                placeholder="Enter description"
                {...field}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Amount (CAD)"
          validateStatus={errors.amount ? 'error' : ''}
          help={errors.amount?.message}
        >
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter amount"
                min={0}
                step={0.01}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Deadline"
          validateStatus={errors.deadline ? 'error' : ''}
          help={errors.deadline?.message}
        >
          <Controller
            name="deadline"
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
          label="Eligibility"
          validateStatus={errors.eligibility ? 'error' : ''}
          help={errors.eligibility?.message}
        >
          <Controller
            name="eligibility"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={3}
                placeholder="Enter eligibility requirements"
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
              <Select {...field} placeholder="Select status">
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="published">Published</Select.Option>
                <Select.Option value="archived">Archived</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Comment"
          validateStatus={errors.comment ? 'error' : ''}
          help={errors.comment?.message}
        >
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={2}
                placeholder="Enter optional comment"
                {...field}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
