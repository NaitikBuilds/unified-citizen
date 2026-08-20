import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Logo from "./Logo";
import { LayoutDashboard, FileText, Plus, Bell, Users, Building2, ScrollText, MessageSquare, LogOut, Menu, X, ChevronDown, User } from "lucide-react";
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
const roleLabel: Record<string, string> = { CITIZEN: "Citizen", OFFICER: "Officer", DEPARTMENT_ADMIN: "Dept Admin", SUPER_ADMIN: "Super Admin" };

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

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markRead(notif.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    }
    if (notif.grievanceId) {
      navigate(user?.role === "CITIZEN" ? `/citizen/grievances/${notif.grievanceId}` : `/officer/grievances/${notif.grievanceId}`);
    }
    setNotifOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#111", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Logo size="sm" />
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/5"}`
              }
            >
              <link.icon className="w-[18px] h-[18px]" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <NavLink to="/chat" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <MessageSquare className="w-[18px] h-[18px]" />
            AI Assistant
          </NavLink>
        </div>
      </aside>

      <div className="lg:ml-64" style={{ background: "#0a0a0a" }}>
        <nav
          className="sticky top-0 z-30 px-4 h-14 flex items-center justify-between"
          style={{ background: "rgba(10,10,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white transition" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h2 className="text-sm font-semibold text-white hidden sm:block">{roleLabel[user?.role || ""] || "Dashboard"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all" onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="p-3 font-semibold text-sm text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                    ) : notifications.map((n) => (
                      <button key={n.id} className={`w-full text-left p-3 transition ${!n.isRead ? "bg-white/5" : ""}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} onClick={() => handleNotifClick(n)}>
                        <div className={`text-sm ${!n.isRead ? "font-semibold text-white" : "text-gray-300"}`}>{n.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all" onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{user?.name}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="font-semibold text-sm text-white">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black">{roleLabel[user?.role || ""]}</span>
                  </div>
                  <div className="p-1.5">
                    <NavLink to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      <User className="h-4 w-4" /> Profile
                    </NavLink>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
