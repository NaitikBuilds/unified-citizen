import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    grievanceApi
      .list(1, 50)
      .then(({ data }) => setGrievances(data.grievances))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = grievances.length;
  const inProgress = grievances.filter(
    (g) => g.status === "IN_PROGRESS"
  ).length;
  const escalated = grievances.filter(
    (g) => g.status === "ESCALATED"
  ).length;
  const resolved = grievances.filter(
    (g) => g.status === "RESOLVED"
  ).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Officer Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Assigned"
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

      {/* Recent assigned grievances */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">
              <BarChart3 className="h-5 w-5" /> Recent Assignments
            </h2>
            <Link to="/officer/grievances" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>
          {grievances.length === 0 ? (
            <p className="text-base-content/60 text-center py-8">
              No grievances assigned yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.slice(0, 5).map((g) => (
                    <tr key={g.id} className="hover">
                      <td>
                        <Link
                          to={`/officer/grievances/${g.id}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {g.ticketId}
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate">{g.title}</td>
                      <td>{g.priority}</td>
                      <td><StatusBadge status={g.status} /></td>
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
