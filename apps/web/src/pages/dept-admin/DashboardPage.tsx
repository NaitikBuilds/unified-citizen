import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { grievanceApi, userApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#60a5fa",
  AI_CLASSIFIED: "#a78bfa",
  ASSIGNED: "#22d3ee",
  IN_PROGRESS: "#fbbf24",
  ESCALATED: "#f87171",
  RESOLVED: "#4ade80",
  REJECTED: "#fb7185",
  REOPENED: "#fb923c",
};

export default function DeptAdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [officerCount, setOfficerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([grievanceApi.list(1, 50), userApi.list(1, 100).catch(() => ({ data: { users: [] } }))])
      .then(([gData, uData]) => { setGrievances(gData.data.grievances); setOfficerCount(uData.data.users.filter((u: { role: string }) => u.role === "OFFICER").length); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Status distribution for the donut
  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    grievances.forEach((g) => map.set(g.status, (map.get(g.status) || 0) + 1));
    return Array.from(map.entries()).map(([status, value]) => ({
      name: status.replace(/_/g, " "),
      value,
      color: STATUS_COLORS[status] || "#9ca3af",
    }));
  }, [grievances]);

  if (loading) return <LoadingSpinner />;
  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;

  const stats = [
    { icon: FileText, label: "Total Grievances", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Department Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor your department's grievances and team performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger">
        {stats.map((s) => (
          <div key={s.label} className="dark-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
              <div className="p-2 rounded-xl" style={{ background: s.bg }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mt-3">{String(s.value).padStart(2, "0")}</div>
          </div>
        ))}
      </div>

      {/* Donut + team + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status donut */}
        <div className="dark-card p-5">
          <h2 className="text-sm font-bold text-white mb-2">Status Breakdown</h2>
          {statusData.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-12">No data yet</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{total}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
                {statusData.map((entry) => (
                  <span key={entry.name} className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team overview */}
        <div className="dark-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> Team Overview</h2>
            <Link to="/dept-admin/users" className="text-xs text-gray-400 hover:text-white transition">Manage →</Link>
          </div>
          <div className="space-y-3 flex-1">
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div className="text-2xl font-bold text-white">{officerCount}</div>
                <div className="text-xs text-gray-500">Active Officers</div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.1)" }}>
                <Users className="h-5 w-5" style={{ color: "#60a5fa" }} />
              </div>
            </div>
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{inProgress + escalated}</div>
                <div className="text-xs text-gray-500">Pending Grievances</div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)" }}>
                <Clock className="h-5 w-5" style={{ color: "#fbbf24" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent grievances */}
        <div className="dark-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Recent Grievances</h2>
            <Link to="/dept-admin/grievances" className="text-xs text-gray-400 hover:text-white transition">View All →</Link>
          </div>
          {grievances.length === 0 ? <p className="text-gray-500 text-center py-10 text-sm">No grievances in your department.</p> : (
            <div className="space-y-1.5">
              {grievances.slice(0, 5).map((g) => (
                <Link key={g.id} to={`/dept-admin/grievances/${g.id}`} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 hover:translate-x-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-gray-500">{g.ticketId}</div>
                    <div className="font-medium text-xs text-white truncate">{g.title.length > 30 ? g.title.slice(0, 30) + "..." : g.title}</div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <StatusBadge status={g.status} />
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
