import { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  housingService,
  type HousingRequest,
  type HousingResponse,
} from '../../../services/housing.service';

const { TextArea } = Input;

/**
 * Housing form schema using Zod
 * Matches HousingRequest.java validation rules
 */
const createSchema = z.object({
  category: z.string().max(512, 'Category must be less than 512 characters').optional(),
  title: z.string().min(1, 'Title is required').max(512, 'Title must be less than 512 characters'),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  campusId: z.string().optional(),
  costRange: z.string().max(2048, 'Cost range must be less than 2048 characters').optional(),
  links: z.string().max(2048, 'Links must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const updateSchema = z.object({
  category: z.string().max(512, 'Category must be less than 512 characters').optional(),
  title: z.string().max(512, 'Title must be less than 512 characters').optional(),
  description: z.string().max(4096, 'Description must be less than 4096 characters').optional(),
  campusId: z.string().optional(),
  costRange: z.string().max(2048, 'Cost range must be less than 2048 characters').optional(),
  links: z.string().max(2048, 'Links must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface HousingFormDrawerProps {
  visible: boolean;
  housing: HousingResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Housing Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields match HousingRequest.java exactly:
 * - title* (required for create, max 512)
 * - category (max 512)
 * - description (max 4096)
 * - campusId (UUID, Select from institution campuses)
 * - costRange (max 2048, JSON)
 * - links (max 2048, JSON)
 * - status (draft | published | archived)
 * - comment (optional, max 500)
 */
export default function HousingFormDrawer({
  visible,
  housing,
  onClose,
  onSuccess,
}: HousingFormDrawerProps) {
  const isEdit = !!housing;
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
      campusId: undefined,
      costRange: '',
      links: '',
      status: 'draft',
      comment: '',
    },
  });

  // Reset form when housing changes
  useEffect(() => {
    if (visible) {
      if (housing) {
        // Edit mode: populate form with existing data
        reset({
          category: housing.category || '',
          title: housing.title || '',
          description: housing.description || '',
          campusId: housing.campusId || undefined,
          costRange: housing.costRange || '',
          links: housing.links || '',
          status: housing.status || 'draft',
          comment: housing.comment || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          category: '',
          title: '',
          description: '',
          campusId: undefined,
          costRange: '',
          links: '',
          status: 'draft',
          comment: '',
        });
      }
    }
  }, [visible, housing, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      const request: HousingRequest = {};
      if (data.category) request.category = data.category;
      if (data.title) request.title = data.title;
      if (data.description) request.description = data.description;
      if (data.campusId) request.campusId = data.campusId;
      if (data.costRange) request.costRange = data.costRange;
      if (data.links) request.links = data.links;
      if (data.status) request.status = data.status;
      if (data.comment) request.comment = data.comment;

      if (isEdit && housing) {
        await housingService.update(housing.id, request);
        message.success('Housing option updated successfully');
      } else {
        await housingService.create(request as HousingRequest);
        message.success('Housing option created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save housing:', error);
      message.error(
        isEdit
          ? 'Failed to update housing option'
          : 'Failed to create housing option'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Housing Option' : 'Create Housing Option'}
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
          label="Campus ID"
          validateStatus={errors.campusId ? 'error' : ''}
          help={errors.campusId?.message}
        >
          <Controller
            name="campusId"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter campus ID (UUID)" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Cost Range (JSON)"
          validateStatus={errors.costRange ? 'error' : ''}
          help={errors.costRange?.message}
        >
          <Controller
            name="costRange"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={2}
                placeholder='Enter cost range as JSON, e.g. {"min": 500, "max": 1000, "unit": "CAD"}'
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
