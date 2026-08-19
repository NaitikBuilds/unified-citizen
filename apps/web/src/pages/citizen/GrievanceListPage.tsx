import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await grievanceApi.list(page, 10);
      let filtered = data.grievances;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.ticketId.toLowerCase().includes(q) ||
            g.category?.toLowerCase().includes(q)
        );
      }
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
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const statusOptions = [
    "SUBMITTED", "AI_CLASSIFIED", "ASSIGNED", "IN_PROGRESS",
    "ESCALATED", "RESOLVED", "REJECTED", "REOPENED",
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Grievances</h1>
        <Link to="/citizen/grievances/new" className="btn btn-primary gap-2">
          <Plus className="h-5 w-5" />
          New Grievance
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="form-control flex-1">
          <div className="input-group">
            <span><Search className="h-4 w-4" /></span>
            <input
              type="text"
              placeholder="Search by title, ticket ID, or category..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <select
          className="select select-bordered w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading grievances..." />
      ) : grievances.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="No grievances found"
          description="You haven't submitted any grievances yet. Click the button above to submit your first one."
          action={
            <Link to="/citizen/grievances/new" className="btn btn-primary">
              Submit Grievance
            </Link>
          }
        />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300 shadow-sm">
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
                        to={`/citizen/grievances/${g.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {g.ticketId}
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/citizen/grievances/${g.id}`}
                        className="font-medium hover:text-primary transition"
                      >
                        {g.title.length > 40 ? g.title.slice(0, 40) + "..." : g.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm">{g.category || "—"}</span>
                    </td>
                    <td><StatusBadge status={g.status} /></td>
                    <td><PriorityBadge priority={g.priority} /></td>
                    <td className="text-sm text-base-content/60">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-base-content/60">
                Showing {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="btn btn-sm btn-ghost no-animation">
                  {page} / {meta.totalPages}
                </span>
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
