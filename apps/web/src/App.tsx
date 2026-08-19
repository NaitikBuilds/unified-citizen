import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";

// Layouts
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ProfilePage from "./pages/public/ProfilePage";
import ChatPage from "./pages/public/ChatPage";

// Citizen pages
import CitizenDashboard from "./pages/citizen/DashboardPage";
import CitizenGrievanceList from "./pages/citizen/GrievanceListPage";
import CitizenCreateGrievance from "./pages/citizen/CreateGrievancePage";
import CitizenGrievanceDetail from "./pages/citizen/GrievanceDetailPage";
import CitizenNotifications from "./pages/citizen/NotificationPage";

// Officer pages
import OfficerDashboard from "./pages/officer/DashboardPage";
import OfficerGrievanceList from "./pages/officer/GrievanceListPage";
import OfficerGrievanceDetail from "./pages/officer/GrievanceDetailPage";

// Dept Admin pages
import DeptAdminDashboard from "./pages/dept-admin/DashboardPage";
import DeptAdminGrievanceList from "./pages/dept-admin/GrievanceListPage";
import DeptAdminGrievanceDetail from "./pages/dept-admin/GrievanceDetailPage";
import DeptAdminUsers from "./pages/dept-admin/UsersPage";

// Super Admin pages
import SuperAdminDashboard from "./pages/super-admin/DashboardPage";
import SuperAdminUsers from "./pages/super-admin/UsersPage";
import SuperAdminDepartments from "./pages/super-admin/DepartmentsPage";
import SuperAdminGrievances from "./pages/super-admin/GrievancesPage";
import SuperAdminAudit from "./pages/super-admin/AuditPage";

function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Citizen */}
          <Route path="/citizen" element={<Layout />}>
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="grievances" element={<CitizenGrievanceList />} />
            <Route path="grievances/new" element={<CitizenCreateGrievance />} />
            <Route path="grievances/:id" element={<CitizenGrievanceDetail />} />
            <Route path="notifications" element={<CitizenNotifications />} />
          </Route>

          {/* Officer */}
          <Route path="/officer" element={<Layout />}>
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="grievances" element={<OfficerGrievanceList />} />
            <Route path="grievances/:id" element={<OfficerGrievanceDetail />} />
          </Route>

          {/* Dept Admin */}
          <Route path="/dept-admin" element={<Layout />}>
            <Route path="dashboard" element={<DeptAdminDashboard />} />
            <Route path="grievances" element={<DeptAdminGrievanceList />} />
            <Route path="grievances/:id" element={<DeptAdminGrievanceDetail />} />
            <Route path="users" element={<DeptAdminUsers />} />
          </Route>

          {/* Super Admin */}
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="departments" element={<SuperAdminDepartments />} />
            <Route path="grievances" element={<SuperAdminGrievances />} />
            <Route path="audit" element={<SuperAdminAudit />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
