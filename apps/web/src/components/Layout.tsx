import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  BarChart3,
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
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
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

function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [railExpanded, setRailExpanded] = useState(false); // desktop hover rail
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
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── RETRACTABLE ICON RAIL (desktop) / DRAWER (mobile) ─── */}
      <aside
        onMouseEnter={() => setRailExpanded(true)}
        onMouseLeave={() => setRailExpanded(false)}
        className={`fixed top-0 left-0 z-50 h-full transform transition-all duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 ${railExpanded ? "lg:w-60" : "lg:w-[68px]"}`}
        style={{
          background: "linear-gradient(180deg, #131313 0%, #0d0d0d 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          boxShadow: railExpanded ? "24px 0 60px rgba(0,0,0,0.55)" : "none",
        }}
      >
        <div className={`h-16 flex items-center px-4 ${railExpanded || sidebarOpen ? "justify-start" : "justify-start lg:justify-center"}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Logo size="sm" showText={railExpanded || sidebarOpen} />
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ height: "calc(100% - 148px)" }}>
          <p className={`px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-opacity duration-200 ${railExpanded ? "opacity-100" : "lg:opacity-0"}`}>
            Workspace
          </p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              title={link.label}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  railExpanded ? "" : "lg:justify-center lg:px-0"
                } ${isActive ? "bg-white text-black glow-active" : "text-gray-400 hover:text-white hover:bg-white/5"}`
              }
            >
              <link.icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${railExpanded ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"}`}>
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <NavLink
            to="/chat"
            title="AI Assistant"
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 ${railExpanded ? "" : "lg:justify-center lg:px-0"}`}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <MessageSquare className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${railExpanded ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"}`}>
              AI Assistant
            </span>
          </NavLink>
          <div className={`flex items-center gap-2.5 px-2 py-1 ${railExpanded ? "" : "lg:justify-center lg:px-0"}`}>
            <div className="w-7 h-7 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className={`min-w-0 transition-opacity duration-200 ${railExpanded ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"}`}>
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{roleLabel[user?.role || ""]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ───────────────────────────────────────── */}
      <div className="lg:ml-[68px]" style={{ background: "#0a0a0a" }}>
        <nav
          className="sticky top-0 z-30 px-4 h-14 flex items-center justify-between"
          style={{ background: "rgba(10,10,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white transition" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h2 className="text-sm font-semibold text-white hidden sm:block">{roleLabel[user?.role || ""] || "Dashboard"} Workspace</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all" onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-pop glass-panel">
                  <div className="p-3 font-semibold text-sm text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                    ) : notifications.map((n) => (
                      <button key={n.id} className={`w-full text-left p-3 transition hover:bg-white/5 ${!n.isRead ? "bg-white/5" : ""}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} onClick={() => handleNotifClick(n)}>
                        <div className={`text-sm flex items-center gap-2 ${!n.isRead ? "font-semibold text-white" : "text-gray-300"}`}>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                          {n.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all" onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}>
                <span className="w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {getInitials(user?.name)}
                </span>
                <span className="hidden sm:inline font-medium">{user?.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden animate-pop glass-panel">
                  <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="font-semibold text-sm text-white">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black">{roleLabel[user?.role || ""]}</span>
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

        {/* Page content with entrance transition (replays per route) */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
