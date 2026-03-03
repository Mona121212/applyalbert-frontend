import { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  supportServiceService,
  type SupportServiceRequest,
  type SupportServiceResponse,
} from '../../../services/support-service.service';

const { TextArea } = Input;

/**
 * Support Service form schema using Zod
 * Based on SupportService entity structure
 */
const createSchema = z.object({
  category: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  contact: z.string().optional(), // JSON
  links: z.string().optional(), // JSON
  status: z.string().optional(),
});

const updateSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  contact: z.string().optional(), // JSON
  links: z.string().optional(), // JSON
  status: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface SupportServiceFormDrawerProps {
  visible: boolean;
  service: SupportServiceResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Support Service Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields based on SupportService entity:
 * - title* (required for create)
 * - category
 * - description
 * - contact (JSON: phone, email, office)
 * - links (JSON: label + url pairs)
 * - status (draft | published | archived)
 */
export default function SupportServiceFormDrawer({
  visible,
  service,
  onClose,
  onSuccess,
}: SupportServiceFormDrawerProps) {
  const isEdit = !!service;
  const schema = isEdit ? updateSchema : createSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      title: '',
      description: '',
      contact: '',
      links: '',
      status: 'draft',
    },
  });

  // Reset form when service changes
  useEffect(() => {
    if (visible) {
      if (service) {
        // Edit mode: populate form with existing data
        reset({
          category: service.category || '',
          title: service.title || '',
          description: service.description || '',
          contact: service.contact || '',
          links: service.links || '',
          status: service.status || 'draft',
        });
      } else {
        // Create mode: reset to empty
        reset({
          category: '',
          title: '',
          description: '',
          contact: '',
          links: '',
          status: 'draft',
        });
      }
    }
  }, [visible, service, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      const request: SupportServiceRequest = {};
      if (data.category) request.category = data.category;
      if (data.title) request.title = data.title;
      if (data.description) request.description = data.description;
      if (data.contact) request.contact = data.contact;
      if (data.links) request.links = data.links;
      if (data.status) request.status = data.status;

      if (isEdit && service) {
        await supportServiceService.update(service.id, request);
        message.success('Support service updated successfully');
      } else {
        await supportServiceService.create(request as SupportServiceRequest);
        message.success('Support service created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save support service:', error);
      message.error(
        isEdit
          ? 'Failed to update support service'
          : 'Failed to create support service'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Support Service' : 'Create Support Service'}
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
          label="Title"
          required={!isEdit}
          validateStatus={errors.title ? 'error' : ''}
          help={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter title" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Category"
          validateStatus={errors.category ? 'error' : ''}
          help={errors.category?.message}
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter category" {...field} />
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
          label="Contact (JSON)"
          validateStatus={errors.contact ? 'error' : ''}
          help={errors.contact?.message}
        >
          <Controller
            name="contact"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={2}
                placeholder='Enter contact info as JSON, e.g. {"phone": "123-456-7890", "email": "contact@example.com", "office": "Room 101"}'
                {...field}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Links (JSON)"
          validateStatus={errors.links ? 'error' : ''}
          help={errors.links?.message}
        >
          <Controller
            name="links"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={2}
                placeholder='Enter links as JSON, e.g. [{"label": "Website", "url": "https://..."}]'
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
      </Form>
    </Drawer>
  );
}
