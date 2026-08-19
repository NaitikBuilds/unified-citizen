import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { grievanceApi, userApi } from "../../lib/api";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function DeptAdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [officerCount, setOfficerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      grievanceApi.list(1, 50),
      userApi.list(1, 100).catch(() => ({ data: { users: [] } })),
    ])
      .then(([gData, uData]) => {
        setGrievances(gData.data.grievances);
        const officers = uData.data.users.filter(
          (u) => u.role === "OFFICER"
        );
        setOfficerCount(officers.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = grievances.length;
  const inProgress = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Department Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Total Grievances"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent grievances */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Recent Grievances</h2>
              <Link to="/dept-admin/grievances" className="btn btn-ghost btn-sm">
                View All
              </Link>
            </div>
            {grievances.length === 0 ? (
              <p className="text-center text-base-content/60 py-8">
                No grievances in your department.
              </p>
            ) : (
              <div className="space-y-2">
                {grievances.slice(0, 5).map((g) => (
                  <Link
                    key={g.id}
                    to={`/dept-admin/grievances/${g.id}`}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-xl hover:bg-base-300 transition"
                  >
                    <div>
                      <div className="font-mono text-xs text-base-content/50">
                        {g.ticketId}
                      </div>
                      <div className="font-medium text-sm">
                        {g.title.length > 30
                          ? g.title.slice(0, 30) + "..."
                          : g.title}
                      </div>
                    </div>
                    <StatusBadge status={g.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">
                <Users className="h-5 w-5" /> Team Overview
              </h2>
              <Link to="/dept-admin/users" className="btn btn-ghost btn-sm">
                Manage
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-base-200 rounded-xl text-center">
                <div className="text-3xl font-bold text-primary">
                  {officerCount}
                </div>
                <div className="text-sm text-base-content/60">
                  Active Officers
                </div>
              </div>
              <div className="p-4 bg-base-200 rounded-xl text-center">
                <div className="text-3xl font-bold text-warning">
                  {inProgress + escalated}
                </div>
                <div className="text-sm text-base-content/60">
                  Pending Grievances
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
