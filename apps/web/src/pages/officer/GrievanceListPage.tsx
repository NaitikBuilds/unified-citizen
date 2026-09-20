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
    setLoading(true); setError(null);
    try { const { data } = await grievanceApi.list(page, 10); let filtered = data.grievances; if (statusFilter) filtered = filtered.filter((g) => g.status === statusFilter); setGrievances(filtered); setMeta(data.meta); } catch { setError("Failed to load grievances"); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchGrievances(); }, [fetchGrievances]);

  const inputStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Assigned Grievances</h1>
      <div className="flex gap-3 mb-6">
        <select className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {["SUBMITTED","AI_CLASSIFIED","ASSIGNED","IN_PROGRESS","ESCALATED","RESOLVED","REJECTED","REOPENED"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      {error && <ErrorAlert message={error} />}
      {loading ? <LoadingSpinner text="Loading..." /> : grievances.length === 0 ? <EmptyState icon={<FileText className="h-16 w-16" />} title="No grievances assigned" description="No grievances match your current filters." /> : (
        <>
          <div className="overflow-x-auto rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Ticket", "Title", "Category", "Status", "Priority", "Created"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3"><Link to={`/officer/grievances/${g.id}`} className="font-mono text-xs text-white hover:underline">{g.ticketId}</Link></td>
                    <td className="px-4 py-3"><Link to={`/officer/grievances/${g.id}`} className="font-medium text-white hover:text-gray-300 transition">{g.title.length > 40 ? g.title.slice(0, 40) + "..." : g.title}</Link></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-lg text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{g.category || "—"}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4 inline" /> Prev</button>
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4 inline" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
