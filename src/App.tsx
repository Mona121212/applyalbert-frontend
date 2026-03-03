import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Guards
import AuthGuard from './guards/AuthGuard';
import AdminGuard from './guards/AdminGuard';
import StaffGuard from './guards/StaffGuard';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';

// Pages - Admin
import AdminDashboardPage from './pages/admin/DashboardPage';
import InstitutionListPage from './pages/admin/institutions/InstitutionListPage';
import StaffListPage from './pages/admin/staff/StaffListPage';

// Pages - Staff
import StaffDashboardPage from './pages/staff/DashboardPage';
import ProgramListPage from './pages/staff/programs/ProgramListPage';
import ProgramEditPage from './pages/staff/programs/ProgramEditPage';
import ScholarshipListPage from './pages/staff/scholarships/ScholarshipListPage';
import HousingListPage from './pages/staff/housing/HousingListPage';
import SupportServiceListPage from './pages/staff/support-services/SupportServiceListPage';
import PathwayListPage from './pages/staff/pathways/PathwayListPage';
import TestimonialListPage from './pages/staff/testimonials/TestimonialListPage';
import BulkUploadPage from './pages/staff/bulk-upload/BulkUploadPage';
import AiManagePage from './pages/staff/ai/AiManagePage';

/**
 * Root Redirect Component
 * 
 * Automatically redirects based on user role:
 * - SUPER_ADMIN or ADMIN → /admin/dashboard
 * - STAFF → /staff/dashboard
 * - Not logged in → /login
 */
function RootRedirect() {
  const { role, accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (normalizedRole === 'STAFF') {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // Unknown role, redirect to login
  return <Navigate to="/login" replace />;
}

/**
 * App Component
 * 
 * Complete routing structure following the design document:
 * 
 * /login                           → LoginPage (AuthLayout)
 * 
 * /admin                           → AdminGuard → AdminLayout
 *   /admin/dashboard               → Admin DashboardPage
 *   /admin/institutions            → InstitutionListPage
 *   /admin/staff                   → StaffListPage
 * 
 * /staff                           → StaffGuard → StaffLayout
 *   /staff/dashboard               → Staff DashboardPage
 *   /staff/programs                → ProgramListPage
 *   /staff/programs/new            → ProgramEditPage (new)
 *   /staff/programs/:id            → ProgramEditPage (edit)
 *   /staff/scholarships            → ScholarshipListPage
 *   /staff/housing                 → HousingListPage
 *   /staff/support-services        → SupportServiceListPage
 *   /staff/pathways                → PathwayListPage
 *   /staff/testimonials            → TestimonialListPage
 *   /staff/bulk-upload             → BulkUploadPage
 *   /staff/ai                      → AiManagePage
 * 
 * /                                → Auto redirect based on role
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path - auto redirect based on role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Admin routes - protected by AdminGuard */}
        <Route
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/institutions" element={<InstitutionListPage />} />
          <Route path="/admin/staff" element={<StaffListPage />} />
        </Route>

        {/* Staff routes - protected by StaffGuard */}
        <Route
          element={
            <StaffGuard>
              <StaffLayout />
            </StaffGuard>
          }
        >
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/programs" element={<ProgramListPage />} />
          <Route path="/staff/programs/new" element={<ProgramEditPage />} />
          <Route path="/staff/programs/:id" element={<ProgramEditPage />} />
          <Route path="/staff/scholarships" element={<ScholarshipListPage />} />
          <Route path="/staff/housing" element={<HousingListPage />} />
          <Route
            path="/staff/support-services"
            element={<SupportServiceListPage />}
          />
          <Route path="/staff/pathways" element={<PathwayListPage />} />
          <Route path="/staff/testimonials" element={<TestimonialListPage />} />
          <Route path="/staff/bulk-upload" element={<BulkUploadPage />} />
          <Route path="/staff/ai" element={<AiManagePage />} />
        </Route>

        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
