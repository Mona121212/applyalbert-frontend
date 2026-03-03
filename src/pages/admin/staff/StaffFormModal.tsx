import { useEffect } from 'react';
import { Modal, Form, Input, Button, Select, message, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  userService,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffUserResponse,
} from '../../../services/user.service';
import type { InstitutionResponse } from '../../../services/institution.service';

/**
 * Create staff form schema using Zod
 * Matches CreateStaffRequest.java validation rules
 */
const createSchema = z.object({
  email: z.string().min(1, 'Email is required').max(255, 'Email must be less than 255 characters').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must be less than 128 characters'),
  displayName: z.string().max(255, 'Display name must be less than 255 characters').optional(),
  role: z.string().max(32, 'Role must be less than 32 characters').optional(),
  institutionId: z.string().min(1, 'Institution is required'),
});

/**
 * Update staff form schema using Zod
 * Matches UpdateStaffRequest.java validation rules
 */
const updateSchema = z.object({
  displayName: z.string().max(255, 'Display name must be less than 255 characters').optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must be less than 128 characters').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface StaffFormModalProps {
  visible: boolean;
  user: StaffUserResponse | null;
  institutions: InstitutionResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Staff Form Modal Component
 * 
 * Used for both Create and Edit operations
 * Fields match CreateStaffRequest/UpdateStaffRequest.java exactly:
 * - email* (create only), password* (create only)
 * - displayName, role (fixed as STAFF, readonly)
 * - institutionId* (Select dropdown from GET /admin/institutions)
 * - newPassword (update only, optional)
 */
export default function StaffFormModal({
  visible,
  user,
  institutions,
  onClose,
  onSuccess,
}: StaffFormModalProps) {
  const isEdit = !!user;
  const schema = isEdit ? updateSchema : createSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      role: 'staff',
      institutionId: '',
      newPassword: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (visible) {
      if (user) {
        // Edit mode: populate form with existing data
        reset({
          displayName: user.displayName || '',
          newPassword: '',
        });
      } else {
        // Create mode: reset to empty
        reset({
          email: '',
          password: '',
          displayName: '',
          role: 'staff',
          institutionId: '',
        });
      }
    }
  }, [visible, user, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      if (isEdit && user) {
        // Update mode
        const request: UpdateStaffRequest = {};
        if (data.displayName) request.displayName = data.displayName;
        if ((data as UpdateFormData).newPassword) {
          request.newPassword = (data as UpdateFormData).newPassword;
        }

        await userService.update(user.id, request);
        message.success('User updated successfully');
      } else {
        // Create mode
        const createData = data as CreateFormData;
        const request: CreateStaffRequest = {
          email: createData.email,
          password: createData.password,
          displayName: createData.displayName,
          role: createData.role || 'staff',
          institutionId: createData.institutionId,
        };

        await userService.create(request);
        message.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error(
        isEdit ? 'Failed to update user' : 'Failed to create user'
      );
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Staff User' : 'Create Staff User'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form layout="vertical">
        {!isEdit && (
          <>
            <Form.Item
              label="Email"
              required
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input type="email" placeholder="Enter email" {...field} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              required
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password placeholder="Enter password (min 6 characters)" {...field} />
                )}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Display Name"
          validateStatus={errors.displayName ? 'error' : ''}
          help={errors.displayName?.message}
        >
          <Controller
            name="displayName"
            control={control}
            render={({ field }) => (
              <Input placeholder="Enter display name" {...field} />
            )}
          />
        </Form.Item>

        {!isEdit && (
          <>
            <Form.Item
              label="Role"
              validateStatus={errors.role ? 'error' : ''}
              help={errors.role?.message}
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select {...field} disabled>
                    <Select.Option value="staff">STAFF</Select.Option>
                    <Select.Option value="admin">ADMIN</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item
              label="Institution"
              required
              validateStatus={errors.institutionId ? 'error' : ''}
              help={errors.institutionId?.message}
            >
              <Controller
                name="institutionId"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Select institution"
                    {...field}
                    options={institutions.map((inst) => ({
                      label: inst.name,
                      value: inst.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </>
        )}

        {isEdit && (
          <Form.Item
            label="New Password (Optional)"
            validateStatus={errors.newPassword ? 'error' : ''}
            help={errors.newPassword?.message}
          >
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <Input.Password placeholder="Enter new password (leave empty to keep current)" {...field} />
              )}
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
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
        </Form.Item>
      </Form>
    </Modal>
  );
}
