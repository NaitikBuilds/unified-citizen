import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Logo from "./Logo";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Bell,
  Users,
  Building2,
  ScrollText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { notificationApi } from "../lib/api";
import type { Notification } from "../types";

const citizenLinks = [
  { to: "/citizen/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/citizen/grievances", icon: FileText, label: "My Grievances" },
  { to: "/citizen/grievances/new", icon: Plus, label: "New Grievance" },
];

const officerLinks = [
  { to: "/officer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/officer/grievances", icon: FileText, label: "Assigned Grievances" },
];

const deptAdminLinks = [
  { to: "/dept-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dept-admin/grievances", icon: FileText, label: "Department Grievances" },
  { to: "/dept-admin/users", icon: Users, label: "Team Members" },
];

const superAdminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/departments", icon: Building2, label: "Departments" },
  { to: "/admin/grievances", icon: FileText, label: "All Grievances" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Logs" },
];

function getNavLinks(role: string) {
  switch (role) {
    case "CITIZEN": return citizenLinks;
    case "OFFICER": return officerLinks;
    case "DEPARTMENT_ADMIN": return deptAdminLinks;
    case "SUPER_ADMIN": return superAdminLinks;
    default: return [];
  }
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks = user ? getNavLinks(user.role) : [];

  useEffect(() => {
    notificationApi.list(1, 10).then(({ data }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markRead(notif.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    if (notif.grievanceId) {
      const detailPath = user?.role === "CITIZEN"
        ? `/citizen/grievances/${notif.grievanceId}`
        : `/officer/grievances/${notif.grievanceId}`;
      navigate(detailPath);
    }
    setNotifOpen(false);
  };

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Officer",
    DEPARTMENT_ADMIN: "Dept Admin",
    SUPER_ADMIN: "Super Admin",
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-base-100 border-r border-base-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-base-300">
          <Logo size="sm" />
        </div>
        <ul className="menu p-4 gap-1">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 ${isActive ? "active font-semibold" : ""}`
                }
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300">
          <NavLink
            to="/chat"
            onClick={() => setSidebarOpen(false)}
            className="btn btn-ghost btn-sm w-full justify-start gap-3"
          >
            <MessageSquare className="h-5 w-5" />
            AI Assistant
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-base-100 border-b border-base-300 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost btn-sm lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h2 className="text-lg font-semibold hidden sm:block">
              {roleLabel[user?.role || ""] || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="dropdown dropdown-end">
              <button
                className="btn btn-ghost btn-circle relative"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="dropdown-content mt-2 w-80 bg-base-100 rounded-box shadow-lg border border-base-300 z-50">
                  <div className="p-3 border-b border-base-300 font-semibold">
                    Notifications
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-base-content/50 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          className={`w-full text-left p-3 border-b border-base-200 hover:bg-base-200 transition ${
                            !n.isRead ? "bg-primary/5" : ""
                          }`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="font-medium text-sm">{n.title}</div>
                          <div className="text-xs text-base-content/60 mt-1 line-clamp-2">
                            {n.message}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="dropdown dropdown-end">
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="dropdown-content mt-2 w-52 bg-base-100 rounded-box shadow-lg border border-base-300 z-50">
                  <div className="p-3 border-b border-base-300">
                    <div className="font-semibold text-sm">{user?.name}</div>
                    <div className="text-xs text-base-content/60">{user?.email}</div>
                    <div className="badge badge-primary badge-sm mt-1">{roleLabel[user?.role || ""]}</div>
                  </div>
                  <ul className="menu p-2">
                    <li>
                      <NavLink to="/profile" onClick={() => setUserMenuOpen(false)}>
                        <User className="h-4 w-4" />
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <button onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}