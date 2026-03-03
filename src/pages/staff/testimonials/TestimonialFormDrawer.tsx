import { useEffect } from 'react';
import { Drawer, Form, Input, Button, InputNumber, Select, message, Space, Rate } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../store/auth.store';
import {
  testimonialService,
  type TestimonialRequest,
  type TestimonialResponse,
} from '../../../services/testimonial.service';

const { TextArea } = Input;

/**
 * Testimonial form schema using Zod
 * Matches TestimonialRequest.java validation rules
 */
const createSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(255, 'Student name must be less than 255 characters'),
  title: z.string().max(255, 'Title must be less than 255 characters').optional(),
  quote: z.string().min(1, 'Quote is required').max(4096, 'Quote must be less than 4096 characters'),
  story: z.string().max(8192, 'Story must be less than 8192 characters').optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  programId: z.string().optional(),
  institutionId: z.string().min(1, 'Institution ID is required'),
  photoUrl: z.string().max(2048, 'Photo URL must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const updateSchema = z.object({
  studentName: z.string().max(255, 'Student name must be less than 255 characters').optional(),
  title: z.string().max(255, 'Title must be less than 255 characters').optional(),
  quote: z.string().max(4096, 'Quote must be less than 4096 characters').optional(),
  story: z.string().max(8192, 'Story must be less than 8192 characters').optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  programId: z.string().optional(),
  photoUrl: z.string().max(2048, 'Photo URL must be less than 2048 characters').optional(),
  status: z.string().optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface TestimonialFormDrawerProps {
  visible: boolean;
  testimonial: TestimonialResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Testimonial Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields match TestimonialRequest.java exactly:
 * - studentName* (required for create, max 255)
 * - title (max 255)
 * - quote* (required for create, max 4096, textarea)
 * - story (max 8192, textarea)
 * - rating* (required for create, 1-5 Star Picker)
 * - programId (Select, optional)
 * - institutionId (readonly display, current institution from JWT)
 * - photoUrl (max 2048)
 * - status (draft | published | archived)
 * - comment (optional, max 500)
 */
export default function TestimonialFormDrawer({
  visible,
  testimonial,
  onClose,
  onSuccess,
}: TestimonialFormDrawerProps) {
  const isEdit = !!testimonial;
  const schema = isEdit ? updateSchema : createSchema;
  const { institutionId } = useAuthStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentName: '',
      title: '',
      quote: '',
      story: '',
      rating: 5,
      programId: undefined,
      institutionId: institutionId || '',
      photoUrl: '',
      status: 'draft',
      comment: '',
    },
  });

  // Reset form when testimonial changes
  useEffect(() => {
    if (visible) {
      if (testimonial) {
        // Edit mode: populate form with existing data
        reset({
          studentName: testimonial.studentName || '',
          title: testimonial.title || '',
          quote: testimonial.quote || '',
          story: testimonial.story || '',
          rating: testimonial.rating || 5,
          programId: testimonial.programId || undefined,
          photoUrl: testimonial.photoUrl || '',
          status: testimonial.status || 'draft',
          comment: testimonial.comment || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          studentName: '',
          title: '',
          quote: '',
          story: '',
          rating: 5,
          programId: undefined,
          institutionId: institutionId || '',
          photoUrl: '',
          status: 'draft',
          comment: '',
        });
      }
    }
  }, [visible, testimonial, institutionId, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      const request: TestimonialRequest = {};
      if (data.studentName) request.studentName = data.studentName;
      if (data.title) request.title = data.title;
      if (data.quote) request.quote = data.quote;
      if (data.story) request.story = data.story;
      if (data.rating !== undefined) request.rating = data.rating;
      if (data.programId) request.programId = data.programId;
      if (!isEdit && institutionId) request.institutionId = institutionId;
      if (data.photoUrl) request.photoUrl = data.photoUrl;
      if (data.status) request.status = data.status;
      if (data.comment) request.comment = data.comment;

      if (isEdit && testimonial) {
        await testimonialService.update(testimonial.id, request);
        message.success('Testimonial updated successfully');
      } else {
        await testimonialService.create(request as TestimonialRequest);
        message.success('Testimonial created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      message.error(
        isEdit
          ? 'Failed to update testimonial'
          : 'Failed to create testimonial'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Testimonial' : 'Create Testimonial'}
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
          label="Student Name"
          required={!isEdit}
          validateStatus={errors.studentName ? 'error' : ''}
          help={errors.studentName?.message}
        >
          <Controller
            name="studentName"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter student name" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Title"
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
          label="Quote"
          required={!isEdit}
          validateStatus={errors.quote ? 'error' : ''}
          help={errors.quote?.message}
        >
          <Controller
            name="quote"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={4}
                placeholder="Enter quote"
                {...field}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Story"
          validateStatus={errors.story ? 'error' : ''}
          help={errors.story?.message}
        >
          <Controller
            name="story"
            control={control}
            render={({ field }) => (
              <TextArea
                rows={4}
                placeholder="Enter story"
                {...field}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Rating"
          required={!isEdit}
          validateStatus={errors.rating ? 'error' : ''}
          help={errors.rating?.message}
        >
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rate
                value={field.value}
                onChange={field.onChange}
                count={5}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Program ID"
          validateStatus={errors.programId ? 'error' : ''}
          help={errors.programId?.message}
        >
          <Controller
            name="programId"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter program ID (UUID, optional)" {...field} />
            )}
          />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            label="Institution ID"
            validateStatus={errors.institutionId ? 'error' : ''}
            help={errors.institutionId?.message}
          >
            <Controller
              name="institutionId"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Institution ID"
                  {...field}
                  disabled
                  value={institutionId || ''}
                />
              )}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Photo URL"
          validateStatus={errors.photoUrl ? 'error' : ''}
          help={errors.photoUrl?.message}
        >
          <Controller
            name="photoUrl"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter photo URL" {...field} />
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
