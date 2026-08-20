import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import type { Grievance, PaginationMeta } from "../../types";

const inputStyle = { background: "#111", border: "1px solid rgba(255,255,255,0.1)" };

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchGrievances = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await grievanceApi.list(page, 15);
      let filtered = data.grievances;
      if (search) { const q = search.toLowerCase(); filtered = filtered.filter((g) => g.title.toLowerCase().includes(q) || g.ticketId.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)); }
      if (statusFilter) filtered = filtered.filter((g) => g.status === statusFilter);
      if (priorityFilter) filtered = filtered.filter((g) => g.priority === priorityFilter);
      setGrievances(filtered); setMeta(data.meta);
    } catch { setError("Failed to load grievances"); } finally { setLoading(false); }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchGrievances(); }, [fetchGrievances]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Grievances</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" placeholder="Search by title, ticket, category..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={inputStyle} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {["SUBMITTED","AI_CLASSIFIED","ASSIGNED","IN_PROGRESS","ESCALATED","RESOLVED","REJECTED","REOPENED"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">All Priority</option>
          {["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {error && <ErrorAlert message={error} />}
      {loading ? <LoadingSpinner /> : grievances.length === 0 ? <EmptyState icon={<FileText className="h-16 w-16" />} title="No grievances found" description="No grievances match your filters." /> : (
        <>
          <div className="overflow-x-auto rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Ticket", "Title", "Citizen", "Department", "Status", "Priority", "Created"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3"><Link to="/admin/grievances" className="font-mono text-xs text-white hover:underline">{g.ticketId}</Link></td>
                    <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{g.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{g.citizen?.name || "—"}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-lg text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{g.department?.name || "—"}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
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
