import { useState, useEffect, useCallback } from "react";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

interface AuditEntry { id: string; action: string; userId: string | null; grievanceId: string | null; oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null; metadata: Record<string, unknown> | null; createdAt: string; user?: { id: string; name: string } | null; }

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await grievanceApi.list(page, 20);
      const entries: AuditEntry[] = [];
      data.grievances.forEach((g) => {
        entries.push({ id: g.id + "-created", action: "GRIEVANCE_CREATED", userId: g.citizenId, grievanceId: g.id, oldValue: null, newValue: { title: g.title, status: g.status, priority: g.priority }, metadata: null, createdAt: g.createdAt });
        if (g.status !== "SUBMITTED") entries.push({ id: g.id + "-status", action: "STATUS_CHANGED", userId: null, grievanceId: g.id, oldValue: { status: "SUBMITTED" }, newValue: { status: g.status }, metadata: null, createdAt: g.updatedAt });
      });
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLogs(entries);
    } catch { /* */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColor: Record<string, string> = { GRIEVANCE_CREATED: "text-blue-400", STATUS_CHANGED: "text-yellow-400", ASSIGN_GRIEVANCE: "text-purple-400", ESCALATE_GRIEVANCE: "text-red-400" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Audit Logs</h1>
      {loading ? <LoadingSpinner /> : logs.length === 0 ? <EmptyState icon={<ScrollText className="h-16 w-16" />} title="No audit logs" description="Audit entries will appear as actions are taken." /> : (
        <>
          <div className="overflow-x-auto rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Action", "User", "Grievance", "Details", "Time"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold ${actionColor[log.action] || "text-gray-400"}`}>{log.action.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.user?.name || log.userId?.slice(0, 8) || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-purple-400">{log.grievanceId?.slice(0, 12) || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{log.newValue ? JSON.stringify(log.newValue).slice(0, 60) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-3 py-1.5 rounded-xl text-sm text-white">Page {page}</span>
            <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></button>
          </div>
        </>
      )}
    </div>
  );
}
