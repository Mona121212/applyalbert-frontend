import { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  pathwayService,
  type PathwayRequest,
  type PathwayResponse,
} from '../../../services/pathway.service';

const { TextArea } = Input;

/**
 * Pathway form schema using Zod
 * Matches PathwayRequest.java validation rules
 */
const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const updateSchema = z.object({
  name: z.string().max(255, 'Name must be less than 255 characters').optional(),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface PathwayFormDrawerProps {
  visible: boolean;
  pathway: PathwayResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Pathway Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields match PathwayRequest.java exactly:
 * - name* (required for create, max 255)
 * - description (max 4096)
 * - status (draft | published | archived)
 * - comment (optional, max 500)
 */
export default function PathwayFormDrawer({
  visible,
  pathway,
  onClose,
  onSuccess,
}: PathwayFormDrawerProps) {
  const isEdit = !!pathway;
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
      status: 'draft',
      comment: '',
    },
  });

  // Reset form when pathway changes
  useEffect(() => {
    if (visible) {
      if (pathway) {
        // Edit mode: populate form with existing data
        reset({
          name: pathway.name || '',
          description: pathway.description || '',
          status: pathway.status || 'draft',
          comment: pathway.comment || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          name: '',
          description: '',
          status: 'draft',
          comment: '',
        });
      }
    }
  }, [visible, pathway, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      const request: PathwayRequest = {};
      if (data.name) request.name = data.name;
      if (data.description) request.description = data.description;
      if (data.status) request.status = data.status;
      if (data.comment) request.comment = data.comment;

      if (isEdit && pathway) {
        await pathwayService.update(pathway.id, request);
        message.success('Pathway updated successfully');
      } else {
        await pathwayService.create(request as PathwayRequest);
        message.success('Pathway created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save pathway:', error);
      message.error(
        isEdit
          ? 'Failed to update pathway'
          : 'Failed to create pathway'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Pathway' : 'Create Pathway'}
      size={720}
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
              <Input placeholder="Enter pathway name" {...field} />
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
