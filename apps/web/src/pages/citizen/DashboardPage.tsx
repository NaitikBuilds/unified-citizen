import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Grievance } from "../../types";

export default function CitizenDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    grievanceApi
      .list(1, 100)
      .then(({ data }) => setGrievances(data.grievances))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = grievances.length;
  const inProgress = grievances.filter(
    (g) => g.status === "IN_PROGRESS" || g.status === "ASSIGNED"
  ).length;
  const resolved = grievances.filter((g) => g.status === "RESOLVED").length;
  const escalated = grievances.filter((g) => g.status === "ESCALATED").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome Back!</h1>
        <Link to="/citizen/grievances/new" className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Grievance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      </div>

      {/* Recent grievances */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">
              <BarChart3 className="h-5 w-5" /> Recent Activity
            </h2>
            <Link to="/citizen/grievances" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>
          {grievances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/60 mb-4">
                You haven&apos;t submitted any grievances yet.
              </p>
              <Link to="/citizen/grievances/new" className="btn btn-primary">
                Submit Your First Grievance
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {grievances.slice(0, 5).map((g) => (
                <Link
                  key={g.id}
                  to={`/citizen/grievances/${g.id}`}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-xl hover:bg-base-300 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-base-content/50">
                        {g.ticketId}
                      </span>
                      <span className="text-xs text-base-content/40">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-medium text-sm truncate">
                      {g.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge status={g.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
