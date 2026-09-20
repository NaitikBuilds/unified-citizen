import { useState, useEffect } from "react";
import { FileText, Users, Building2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { grievanceApi, departmentApi, userApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance, Department } from "../../types";

const COLORS = ["#7c5cfc", "#f87171", "#4ade80", "#facc15", "#38bdf8", "#fb923c"];
const S = { bg: "#111", border: "1px solid rgba(255,255,255,0.07)" };

export default function SuperAdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([grievanceApi.list(1, 200), departmentApi.list(), userApi.list(1, 1)])
      .then(([gRes, dRes, uRes]) => { setGrievances(gRes.data.grievances); setDepartments(dRes.data.departments); setUserCount(uRes.data.meta.total); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;
  const submitted = grievances.filter((g) => g.status === "SUBMITTED").length;

  const statusData = [{ name: "Submitted", value: submitted }, { name: "In Progress", value: inProgress }, { name: "Escalated", value: escalated }, { name: "Resolved", value: resolved }].filter((d) => d.value > 0);

  const deptMap = new Map<string, number>();
  grievances.forEach((g) => { const deptName = g.department?.name || "Unassigned"; deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1); });
  const deptData = Array.from(deptMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const stats = [
    { icon: FileText, label: "Total", value: total, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { icon: Clock, label: "In Progress", value: inProgress, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: AlertTriangle, label: "Escalated", value: escalated, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { icon: CheckCircle, label: "Resolved", value: resolved, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    { icon: Users, label: "Users", value: userCount, color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
    { icon: Building2, label: "Departments", value: departments.length, color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">System Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl" style={S}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Status Distribution</h2>
          {statusData.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">By Department</h2>
          {deptData.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "#888" }} interval={0} angle={-20} textAnchor="end" height={60} /><YAxis tick={{ fill: "#888" }} /><Tooltip /><Bar dataKey="count" fill="#7c5cfc" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
