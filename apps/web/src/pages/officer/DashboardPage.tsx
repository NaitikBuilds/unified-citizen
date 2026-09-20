import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, CheckCircle, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { grievanceApi.list(1, 50).then(({ data }) => setGrievances(data.grievances)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;

  // Priority breakdown for the bar chart
  const priorityData = useMemo(() => {
    const order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
    const colors: Record<string, string> = { LOW: "#4ade80", MEDIUM: "#facc15", HIGH: "#fb923c", CRITICAL: "#f87171" };
    return order.map((p) => ({
      name: p.charAt(0) + p.slice(1).toLowerCase(),
      count: grievances.filter((g) => g.priority === p).length,
      color: colors[p],
    }));
  }, [grievances]);

  if (loading) return <LoadingSpinner />;

  const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { icon: FileText, label: "Assigned", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your assigned grievances at a glance.</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
          <TrendingUp className="w-3.5 h-3.5" /> {completionRate}% resolved
        </div>
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

      {/* Priority chart + recent assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority breakdown */}
        <div className="dark-card p-5">
          <h2 className="text-sm font-bold text-white mb-4">Priority Breakdown</h2>
          {total === 0 ? (
            <p className="text-center text-gray-500 text-sm py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={priorityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "#888" }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" name="Grievances" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent assignments table */}
        <div className="dark-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Recent Assignments</h2>
            <Link to="/officer/grievances" className="text-xs text-gray-400 hover:text-white transition">View All →</Link>
          </div>
          {grievances.length === 0 ? <p className="text-gray-500 text-center py-10">No grievances assigned yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Ticket", "Title", "Priority", "Status", ""].map((h) => <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {grievances.slice(0, 5).map((g) => (
                    <tr key={g.id} className="group hover:bg-white/[0.04] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-3 py-3"><Link to={`/officer/grievances/${g.id}`} className="font-mono text-xs text-gray-400 group-hover:text-white transition-colors">{g.ticketId}</Link></td>
                      <td className="px-3 py-3 text-gray-300 max-w-[200px] truncate text-sm">{g.title}</td>
                      <td className="px-3 py-3"><PriorityBadge priority={g.priority} /></td>
                      <td className="px-3 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-3 py-3"><ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
