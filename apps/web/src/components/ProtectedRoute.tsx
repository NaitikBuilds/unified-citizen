import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap: Record<string, string> = {
      CITIZEN: "/citizen/dashboard",
      OFFICER: "/officer/dashboard",
      DEPARTMENT_ADMIN: "/dept-admin/dashboard",
      SUPER_ADMIN: "/admin/dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
