import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { grievanceApi, departmentApi, userApi } from "../../lib/api";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance, Department } from "../../types";

const COLORS = [
  "oklch(45% 0.24 277)",
  "oklch(65% 0.241 354)",
  "oklch(77% 0.152 182)",
  "oklch(82% 0.189 84)",
  "oklch(71% 0.194 13)",
  "oklch(76% 0.177 163)",
];

export default function SuperAdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      grievanceApi.list(1, 200),
      departmentApi.list(),
      userApi.list(1, 1),
    ])
      .then(([gRes, dRes, uRes]) => {
        setGrievances(gRes.data.grievances);
        setDepartments(dRes.data.departments);
        setUserCount(uRes.data.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;
  const submitted = grievances.filter((g) => g.status === "SUBMITTED").length;

  // Status distribution for pie chart
  const statusData = [
    { name: "Submitted", value: submitted },
    { name: "In Progress", value: inProgress },
    { name: "Escalated", value: escalated },
    { name: "Resolved", value: resolved },
  ].filter((d) => d.value > 0);

  // Department distribution for bar chart
  const deptMap = new Map<string, number>();
  grievances.forEach((g) => {
    const deptName = g.department?.name || "Unassigned";
    deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
  });
  const deptData = Array.from(deptMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Total"
          value={total}
          color="primary"
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          label="In Progress"
          value={inProgress}
          color="warning"
        />
        <StatCard
          icon={<AlertTriangle className="h-6 w-6" />}
          label="Escalated"
          value={escalated}
          color="error"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          label="Resolved"
          value={resolved}
          color="success"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Users"
          value={userCount}
          color="primary"
        />
        <StatCard
          icon={<Building2 className="h-6 w-6" />}
          label="Departments"
          value={departments.length}
          color="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-lg">Status Distribution</h2>
            {statusData.length === 0 ? (
              <p className="text-center text-base-content/60 py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-lg">By Department</h2>
            {deptData.length === 0 ? (
              <p className="text-center text-base-content/60 py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="oklch(45% 0.24 277)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
