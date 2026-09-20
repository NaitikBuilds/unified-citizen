import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { grievanceApi } from "../../lib/api";
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

export default function CitizenDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    grievanceApi.list(1, 100).then(({ data }) => setGrievances(data.grievances)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS" || g.status === "ASSIGNED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;

  // Monthly submissions for the last 6 months (activity chart)
  const activityData = useMemo(() => {
    const months: { name: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const count = grievances.filter((g) => {
        const gd = new Date(g.createdAt);
        return gd.getFullYear() === d.getFullYear() && gd.getMonth() === d.getMonth();
      }).length;
      months.push({ name: label, count });
    }
    return months;
  }, [grievances]);

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

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { icon: FileText, label: "Total Filed", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your grievances in one place.</p>
        </div>
        <Link to="/citizen/grievances/new" className="btn-shine hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold">
          <Plus className="h-4 w-4" /> New Grievance
        </Link>
      </div>

      {/* Top row: activity chart + stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 stagger">
        {/* Activity chart */}
        <div className="dark-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Grievance Activity</p>
              <p className="text-2xl font-bold text-white mt-0.5">{total} <span className="text-sm font-medium text-gray-500">total filed</span></p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
              <TrendingUp className="w-3.5 h-3.5" /> {resolutionRate}% resolved
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#888" }}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "rgba(255,255,255,0.15)" }}
              />
              <Area type="monotone" dataKey="count" name="Filed" stroke="#fff" strokeWidth={2} fill="url(#activityGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stat cards stacked */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {stats.slice(0, 2).map((s) => (
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
      </div>

      {/* Second row: donut + remaining stats + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
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

        {/* Escalated + Resolved cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {stats.slice(2).map((s) => (
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

        {/* Recent activity */}
        <div className="dark-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            <Link to="/citizen/grievances" className="text-xs text-gray-400 hover:text-white transition">View All →</Link>
          </div>
          {grievances.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">Nothing yet.</p>
              <Link to="/citizen/grievances/new" className="btn-shine inline-flex px-4 py-2 rounded-xl bg-white text-black text-xs font-bold">Submit Your First Grievance</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {grievances.slice(0, 4).map((g) => (
                <Link key={g.id} to={`/citizen/grievances/${g.id}`} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 hover:translate-x-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] text-gray-500">{g.ticketId}</span>
                      <span className="text-[10px] text-gray-600">{new Date(g.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-medium text-xs text-white truncate">{g.title}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full status badges row for the latest grievance (keeps badge visibility) */}
      {grievances.length > 0 && (
        <div className="dark-card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs text-gray-500 shrink-0">{grievances[0].ticketId}</span>
              <span className="text-sm text-white truncate">{grievances[0].title}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={grievances[0].status} />
              <Link to={`/citizen/grievances/${grievances[0].id}`} className="text-xs text-gray-400 hover:text-white transition shrink-0">Open →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile CTA */}
      <Link to="/citizen/grievances/new" className="btn-shine sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl z-40" aria-label="New grievance">
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
