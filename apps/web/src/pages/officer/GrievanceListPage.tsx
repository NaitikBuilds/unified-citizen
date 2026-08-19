import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import type { Grievance, PaginationMeta } from "../../types";

export default function GrievanceListPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await grievanceApi.list(page, 10);
      let filtered = data.grievances;
      if (statusFilter) {
        filtered = filtered.filter((g) => g.status === statusFilter);
      }
      setGrievances(filtered);
      setMeta(data.meta);
    } catch {
      setError("Failed to load grievances");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Assigned Grievances</h1>

      <div className="flex gap-3 mb-6">
        <select
          className="select select-bordered w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {[
            "SUBMITTED",
            "AI_CLASSIFIED",
            "ASSIGNED",
            "IN_PROGRESS",
            "ESCALATED",
            "RESOLVED",
            "REJECTED",
            "REOPENED",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading..." />
      ) : grievances.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="No grievances assigned"
          description="No grievances match your current filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id} className="hover">
                    <td>
                      <Link
                        to={`/officer/grievances/${g.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {g.ticketId}
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/officer/grievances/${g.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {g.title.length > 40
                          ? g.title.slice(0, 40) + "..."
                          : g.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm">
                        {g.category || "—"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={g.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-base-content/60">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
