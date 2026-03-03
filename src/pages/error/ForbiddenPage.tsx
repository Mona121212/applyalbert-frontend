import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

/**
 * 403 Forbidden Page
 * 
 * Displayed when:
 * - STAFF tries to access /admin routes
 * - SUPER_ADMIN tries to access /staff routes
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const normalizedRole = role?.toUpperCase();

  // Determine redirect path based on role
  const getRedirectPath = () => {
    if (normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN') {
      return '/admin/dashboard';
    }
    if (normalizedRole === 'STAFF') {
      return '/staff/dashboard';
    }
    return '/login';
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={() => navigate(getRedirectPath())}>
          Go to Dashboard
        </Button>
      }
    />
  );
}
