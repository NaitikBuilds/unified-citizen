import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { grievanceApi.list(1, 50).then(({ data }) => setGrievances(data.grievances)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;

  const stats = [
    { icon: FileText, label: "Assigned", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Officer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-xl" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div><span className="text-xs font-medium text-gray-500">{s.label}</span></div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-gray-400" /> Recent Assignments</h2>
          <Link to="/officer/grievances" className="text-sm text-gray-400 hover:text-white transition">View All →</Link>
        </div>
        {grievances.length === 0 ? <p className="text-gray-500 text-center py-8">No grievances assigned yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Ticket", "Title", "Priority", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {grievances.slice(0, 5).map((g) => (
                  <tr key={g.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3"><Link to={`/officer/grievances/${g.id}`} className="font-mono text-xs text-white hover:underline">{g.ticketId}</Link></td>
                    <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{g.title}</td>
                    <td className="px-4 py-3 text-gray-400">{g.priority}</td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
