import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, FileText, BarChart3, Activity } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

const COLORS = ["#7c5cfc", "#f87171", "#4ade80", "#facc15", "#38bdf8", "#fb923c", "#e879f9", "#2dd4bf"];
const S = { bg: "#111", border: "1px solid rgba(255,255,255,0.07)" };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    grievanceApi
      .list(1, 500)
      .then((res) => setGrievances(res.data.grievances))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = grievances.length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const submitted = grievances.filter((g) => g.status === "SUBMITTED").length;
  const avgResolutionDays = useMemo(() => {
    const resolvedOnes = grievances.filter((g) => g.resolvedAt);
    if (resolvedOnes.length === 0) return 0;
    const totalDays = resolvedOnes.reduce((acc, g) => {
      const created = new Date(g.createdAt).getTime();
      const resolved = new Date(g.resolvedAt!).getTime();
      return acc + (resolved - created) / (1000 * 60 * 60 * 24);
    }, 0);
    return +(totalDays / resolvedOnes.length).toFixed(1);
  }, [grievances]);
  const resolutionRate = total > 0 ? +((resolved / total) * 100).toFixed(1) : 0;

  // Daily trend (last 30 days)
  const dailyTrend = useMemo(() => {
    const map = new Map<string, { submitted: number; resolved: number }>();
    for (let i = 29; i >= 0; i--) {
      map.set(daysAgo(i), { submitted: 0, resolved: 0 });
    }
    grievances.forEach((g) => {
      const day = g.createdAt.slice(0, 10);
      if (map.has(day)) map.get(day)!.submitted++;
      if (g.resolvedAt) {
        const rDay = g.resolvedAt.slice(0, 10);
        if (map.has(rDay)) map.get(rDay)!.resolved++;
      }
    });
    return Array.from(map.entries()).map(([date, data]) => ({
      date: date.slice(5), // MM-DD
      Submitted: data.submitted,
      Resolved: data.resolved,
    }));
  }, [grievances]);

  // Cumulative trend
  const cumulativeTrend = useMemo(() => {
    let cumSubmitted = 0;
    let cumResolved = 0;
    return dailyTrend.map((d) => {
      cumSubmitted += d.Submitted;
      cumResolved += d.Resolved;
      return { date: d.date, "Total Filed": cumSubmitted, "Total Resolved": cumResolved };
    });
  }, [dailyTrend]);

  // Status pie
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    grievances.forEach((g) => { map[g.status] = (map[g.status] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name: name.replace("_", " "), value }))
      .sort((a, b) => b.value - a.value);
  }, [grievances]);

  // Department bar
  const deptData = useMemo(() => {
    const map = new Map<string, number>();
    grievances.forEach((g) => {
      const dept = g.department?.name || "Unassigned";
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [grievances]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    const map: Record<string, number> = {};
    grievances.forEach((g) => { map[g.priority] = (map[g.priority] || 0) + 1; });
    return order.map((p) => ({ priority: p, count: map[p] || 0 }));
  }, [grievances]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    grievances.forEach((g) => {
      const cat = g.category || "Uncategorized";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [grievances]);

  // Category resolution rate
  const categoryResolution = useMemo(() => {
    const map = new Map<string, { total: number; resolved: number }>();
    grievances.forEach((g) => {
      const cat = g.category || "Uncategorized";
      const entry = map.get(cat) || { total: 0, resolved: 0 };
      entry.total++;
      if (g.status === "RESOLVED") entry.resolved++;
      map.set(cat, entry);
    });
    return Array.from(map.entries())
      .map(([category, data]) => ({
        category: category.length > 16 ? category.slice(0, 14) + "…" : category,
        rate: data.total > 0 ? +((data.resolved / data.total) * 100).toFixed(0) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [grievances]);

  // Daily resolution time trend (avg hours to resolve per day for last 30 days)
  const resolutionTimeTrend = useMemo(() => {
    const dayMap = new Map<string, number[]>();
    for (let i = 29; i >= 0; i--) dayMap.set(daysAgo(i), []);
    grievances.forEach((g) => {
      if (g.resolvedAt) {
        const day = g.resolvedAt.slice(0, 10);
        const hours = (new Date(g.resolvedAt).getTime() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60);
        if (dayMap.has(day)) dayMap.get(day)!.push(hours);
      }
    });
    return Array.from(dayMap.entries()).map(([date, hours]) => ({
      date: date.slice(5),
      "Avg Hours": hours.length > 0 ? +(hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(1) : null,
    }));
  }, [grievances]);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: "Total Filed", value: total, icon: FileText, color: "#fff", bg: "rgba(255,255,255,0.07)" },
    { label: "Resolution Rate", value: `${resolutionRate}%`, icon: CheckCircle, color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    { label: "Avg Resolution", value: `${avgResolutionDays}d`, icon: Clock, color: "#facc15", bg: "rgba(250,204,21,0.1)" },
    { label: "In Progress", value: inProgress, icon: Activity, color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
    { label: "Escalated", value: escalated, icon: AlertTriangle, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { label: "Pending Review", value: submitted, icon: TrendingUp, color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl" style={S}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Daily trend + Cumulative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Daily Submissions vs Resolutions (30d)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#666" }} interval={4} />
              <YAxis tick={{ fill: "#666" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="Submitted" stroke="#7c5cfc" fill="url(#gradSub)" strokeWidth={2} />
              <Area type="monotone" dataKey="Resolved" stroke="#4ade80" fill="url(#gradRes)" strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Cumulative Growth</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cumulativeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#666" }} interval={4} />
              <YAxis tick={{ fill: "#666" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Line type="monotone" dataKey="Total Filed" stroke="#7c5cfc" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Total Resolved" stroke="#4ade80" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Status pie + Priority bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Status Distribution</h2>
          {statusData.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={110} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Priority Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: "#666" }} />
              <YAxis type="category" dataKey="priority" tick={{ fill: "#aaa", fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.priority === "CRITICAL" ? "#f87171" : entry.priority === "HIGH" ? "#fb923c" : entry.priority === "MEDIUM" ? "#facc15" : "#4ade80"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Department bar + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">By Department</h2>
          {deptData.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "#888" }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                <Bar dataKey="count" fill="#7c5cfc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">By Category</h2>
          {categoryData.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#888" }} interval={0} angle={-30} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "#888" }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 4: Resolution rate by category + Resolution time trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Resolution Rate by Category (%)</h2>
          {categoryResolution.length === 0 ? <p className="text-center text-gray-500 py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryResolution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#666" }} />
                <YAxis type="category" dataKey="category" tick={{ fill: "#aaa", fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {categoryResolution.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 70 ? "#4ade80" : entry.rate >= 40 ? "#facc15" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={S}>
          <h2 className="text-lg font-bold text-white mb-4">Avg Resolution Time (hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTimeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#666" }} interval={4} />
              <YAxis tick={{ fill: "#666" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
              <Bar dataKey="Avg Hours" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
