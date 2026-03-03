import { useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  institutionService,
  type InstitutionRequest,
  type InstitutionResponse,
} from '../../../services/institution.service';

const { TextArea } = Input;

/**
 * Institution form schema using Zod
 * Matches InstitutionRequest.java validation rules
 */
const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  website: z.string().min(1, 'Website is required').max(500, 'Website must be less than 500 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  province: z.string().min(1, 'Province is required').max(100, 'Province must be less than 100 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
  accreditation: z.string().min(1, 'Accreditation is required').max(500, 'Accreditation must be less than 500 characters'),
  contactEmail: z.string().min(1, 'Contact email is required').max(255, 'Contact email must be less than 255 characters').email('Invalid email format'),
  contactPhone: z.string().min(1, 'Contact phone is required').max(50, 'Contact phone must be less than 50 characters'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

const updateSchema = z.object({
  name: z.string().max(255, 'Name must be less than 255 characters').optional(),
  website: z.string().max(500, 'Website must be less than 500 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  province: z.string().max(100, 'Province must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  accreditation: z.string().max(500, 'Accreditation must be less than 500 characters').optional(),
  contactEmail: z.string().max(255, 'Contact email must be less than 255 characters').email('Invalid email format').optional().or(z.literal('')),
  contactPhone: z.string().max(50, 'Contact phone must be less than 50 characters').optional(),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface InstitutionFormDrawerProps {
  visible: boolean;
  institution: InstitutionResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Institution Form Drawer Component
 * 
 * Used for both Create and Edit operations
 * Fields match InstitutionRequest.java exactly:
 * - name*, website*, description*, city*, province*, country*
 * - accreditation*, contactEmail*, contactPhone*
 * - comment (optional)
 */
export default function InstitutionFormDrawer({
  visible,
  institution,
  onClose,
  onSuccess,
}: InstitutionFormDrawerProps) {
  const isEdit = !!institution;
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
      website: '',
      description: '',
      city: '',
      province: '',
      country: '',
      accreditation: '',
      contactEmail: '',
      contactPhone: '',
      comment: '',
    },
  });

  // Reset form when institution changes
  useEffect(() => {
    if (visible) {
      if (institution) {
        // Edit mode: populate form with existing data
        reset({
          name: institution.name || '',
          website: institution.website || '',
          description: institution.description || '',
          city: institution.city || '',
          province: institution.province || '',
          country: institution.country || '',
          accreditation: institution.accreditation || '',
          contactEmail: institution.contactEmail || '',
          contactPhone: institution.contactPhone || '',
          comment: institution.comment || '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          name: '',
          website: '',
          description: '',
          city: '',
          province: '',
          country: '',
          accreditation: '',
          contactEmail: '',
          contactPhone: '',
          comment: '',
        });
      }
    }
  }, [visible, institution, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      // Remove empty strings for optional fields in update mode
      const request: InstitutionRequest = {};
      if (data.name) request.name = data.name;
      if (data.website) request.website = data.website;
      if (data.description) request.description = data.description;
      if (data.city) request.city = data.city;
      if (data.province) request.province = data.province;
      if (data.country) request.country = data.country;
      if (data.accreditation) request.accreditation = data.accreditation;
      if (data.contactEmail) request.contactEmail = data.contactEmail;
      if (data.contactPhone) request.contactPhone = data.contactPhone;
      if (data.comment) request.comment = data.comment;

      if (isEdit && institution) {
        await institutionService.update(institution.id, request);
        message.success('Institution updated successfully');
      } else {
        await institutionService.create(request as InstitutionRequest);
        message.success('Institution created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save institution:', error);
      message.error(
        isEdit
          ? 'Failed to update institution'
          : 'Failed to create institution'
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Institution' : 'Create Institution'}
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
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter institution name" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Website"
          required
          validateStatus={errors.website ? 'error' : ''}
          help={errors.website?.message}
        >
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter website URL" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          required
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
          label="City"
          required
          validateStatus={errors.city ? 'error' : ''}
          help={errors.city?.message}
        >
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter city" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Province"
          required
          validateStatus={errors.province ? 'error' : ''}
          help={errors.province?.message}
        >
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter province" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Country"
          required
          validateStatus={errors.country ? 'error' : ''}
          help={errors.country?.message}
        >
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter country" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Accreditation"
          required
          validateStatus={errors.accreditation ? 'error' : ''}
          help={errors.accreditation?.message}
        >
          <Controller
            name="accreditation"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter accreditation" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Contact Email"
          required
          validateStatus={errors.contactEmail ? 'error' : ''}
          help={errors.contactEmail?.message}
        >
          <Controller
            name="contactEmail"
            control={control}
            render={({ field }) => (
              <Input type="email" placeholder="Enter contact email" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Contact Phone"
          required
          validateStatus={errors.contactPhone ? 'error' : ''}
          help={errors.contactPhone?.message}
        >
          <Controller
            name="contactPhone"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter contact phone" {...field} />
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
                rows={3}
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
