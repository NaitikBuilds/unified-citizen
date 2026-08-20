import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

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

  if (loading) return <LoadingSpinner />;

  const stats = [
    { icon: FileText, label: "Total", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
        <Link to="/citizen/grievances/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition">
          <Plus className="h-4 w-4" /> New Grievance
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-gray-400" /> Recent Activity</h2>
          <Link to="/citizen/grievances" className="text-sm text-gray-400 hover:text-white transition">View All →</Link>
        </div>
        {grievances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't submitted any grievances yet.</p>
            <Link to="/citizen/grievances/new" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition">Submit Your First Grievance</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {grievances.slice(0, 5).map((g) => (
              <Link key={g.id} to={`/citizen/grievances/${g.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{g.ticketId}</span>
                    <span className="text-xs text-gray-600">{new Date(g.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-medium text-sm text-white truncate">{g.title}</div>
                </div>
                <div className="ml-4"><StatusBadge status={g.status} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
