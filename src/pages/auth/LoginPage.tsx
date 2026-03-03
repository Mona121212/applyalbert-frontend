import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

const { Title, Text } = Typography;

/**
 * Login form schema using Zod
 * Matches LoginRequest.java: email (required), password (required), totpCode (optional)
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(512, 'Password must be less than 512 characters'),
  totpCode: z
    .string()
    .max(16, 'TOTP code must be less than 16 characters')
    .optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Page Component
 * 
 * Features:
 * - AntD Form UI
 * - React Hook Form for form state management
 * - Zod validation
 * - Real backend API call via authService.login
 * - JWT parsing and storage via auth.store
 * - Role-based navigation after successful login
 * 
 * Acceptance Criteria:
 * ✔ Real backend login call
 * ✔ Backend returns JWT
 * ✔ JWT is parsed
 * ✔ Role is stored in store
 * ✔ Page navigation based on role
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      totpCode: undefined,
    },
  });

  /**
   * Handle form submission
   * Calls real backend API and handles navigation
   */
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Real backend API call
      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
        totpCode: data.totpCode && data.totpCode.trim() !== '' ? data.totpCode : undefined,
      });

      // Verify that JWT was parsed and role was stored
      const authStore = useAuthStore.getState();
      const role = authStore.role;

      if (!role) {
        throw new Error('Role not found in auth store after login');
      }

      // Navigate based on role
      // ADMIN → /admin/dashboard (backend returns "ADMIN", not "SUPER_ADMIN")
      // STAFF → /staff/dashboard
      const normalizedRole = role.toUpperCase();
      if (normalizedRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (normalizedRole === 'STAFF') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        throw new Error(`Unknown role: ${role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Extract error message
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e7eb 100%)',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}
        styles={{
          body: {
            padding: '40px',
          },
        }}
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 600, 
              color: '#003366',
              marginBottom: '8px',
            }}>
              ApplyAlberta
            </div>
            <Title level={2} style={{ marginBottom: '4px', color: '#003366' }}>
              Admin Login
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Sign in to your admin account
            </Text>
          </div>

          {error && (
            <Alert
              title="Login Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your email"
                    size="large"
                    {...field}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    size="large"
                    {...field}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="TOTP Code (Optional)"
              validateStatus={errors.totpCode ? 'error' : ''}
              help={errors.totpCode?.message}
            >
              <Controller
                name="totpCode"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="Enter TOTP code if enabled"
                    size="large"
                    maxLength={16}
                    {...field}
                  />
                )}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: 500,
                  background: '#003366',
                  borderColor: '#003366',
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
