import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { grievanceApi, userApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function DeptAdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [officerCount, setOfficerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([grievanceApi.list(1, 50), userApi.list(1, 100).catch(() => ({ data: { users: [] } }))])
      .then(([gData, uData]) => { setGrievances(gData.data.grievances); setOfficerCount(uData.data.users.filter((u: { role: string }) => u.role === "OFFICER").length); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;

  const stats = [
    { icon: FileText, label: "Total Grievances", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Department Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-xl" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div><span className="text-xs font-medium text-gray-500">{s.label}</span></div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Grievances</h2>
            <Link to="/dept-admin/grievances" className="text-sm text-gray-400 hover:text-white transition">View All →</Link>
          </div>
          {grievances.length === 0 ? <p className="text-gray-500 text-center py-8">No grievances in your department.</p> : (
            <div className="space-y-2">
              {grievances.slice(0, 5).map((g) => (
                <Link key={g.id} to={`/dept-admin/grievances/${g.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div><div className="font-mono text-xs text-gray-500">{g.ticketId}</div><div className="font-medium text-sm text-white">{g.title.length > 30 ? g.title.slice(0, 30) + "..." : g.title}</div></div>
                  <StatusBadge status={g.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="h-5 w-5 text-gray-400" /> Team Overview</h2>
            <Link to="/dept-admin/users" className="text-sm text-gray-400 hover:text-white transition">Manage →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-3xl font-bold text-white">{officerCount}</div>
              <div className="text-sm text-gray-500">Active Officers</div>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-3xl font-bold text-yellow-400">{inProgress + escalated}</div>
              <div className="text-sm text-gray-500">Pending Grievances</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
