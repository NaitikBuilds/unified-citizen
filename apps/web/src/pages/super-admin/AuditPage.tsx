import { useState, useEffect, useCallback } from "react";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

interface AuditEntry {
  id: string;
  action: string;
  userId: string | null;
  grievanceId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string } | null;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Use grievance list as proxy — real audit endpoint would be separate
      // For now we pull all grievances and their audit data
      const { data } = await grievanceApi.list(page, 20);
      // Since the backend doesn't have a direct audit log list endpoint exposed
      // to the frontend, we construct a view from grievance status changes
      const entries: AuditEntry[] = [];
      data.grievances.forEach((g) => {
        entries.push({
          id: g.id + "-created",
          action: "GRIEVANCE_CREATED",
          userId: g.citizenId,
          grievanceId: g.id,
          oldValue: null,
          newValue: { title: g.title, status: g.status, priority: g.priority },
          metadata: null,
          createdAt: g.createdAt,
        });
        if (g.status !== "SUBMITTED") {
          entries.push({
            id: g.id + "-status",
            action: "STATUS_CHANGED",
            userId: null,
            grievanceId: g.id,
            oldValue: { status: "SUBMITTED" },
            newValue: { status: g.status },
            metadata: null,
            createdAt: g.updatedAt,
          });
        }
      });
      entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(entries);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionColor: Record<string, string> = {
    GRIEVANCE_CREATED: "badge-info",
    STATUS_CHANGED: "badge-warning",
    ASSIGN_GRIEVANCE: "badge-primary",
    ESCALATE_GRIEVANCE: "badge-error",
    CREATE_DEPARTMENT: "badge-success",
    UPDATE_USER_ROLE_OR_DEPT: "badge-accent",
    DELETE_GRIEVANCE: "badge-error",
    REOPEN_GRIEVANCE: "badge-warning",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-16 w-16" />}
          title="No audit logs"
          description="Audit entries will appear as actions are taken."
        />
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Grievance</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover">
                    <td>
                      <span
                        className={`badge badge-sm ${
                          actionColor[log.action] || "badge-ghost"
                        }`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="text-sm">
                      {log.user?.name || log.userId?.slice(0, 8) || "—"}
                    </td>
                    <td className="font-mono text-xs text-primary">
                      {log.grievanceId?.slice(0, 12) || "—"}
                    </td>
                    <td className="text-xs max-w-[200px] truncate">
                      {log.newValue
                        ? JSON.stringify(log.newValue).slice(0, 60)
                        : "—"}
                    </td>
                    <td className="text-xs text-base-content/60">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="btn btn-sm btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="btn btn-sm btn-ghost no-animation">
              Page {page}
            </span>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
