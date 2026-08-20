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
    setLoading(true); setError(null);
    try {
      const { data } = await grievanceApi.list(page, 10);
      let filtered = data.grievances;
      if (search) { const q = search.toLowerCase(); filtered = filtered.filter((g) => g.title.toLowerCase().includes(q) || g.ticketId.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)); }
      if (statusFilter) filtered = filtered.filter((g) => g.status === statusFilter);
      setGrievances(filtered); setMeta(data.meta);
    } catch { setError("Failed to load grievances"); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchGrievances(); }, [fetchGrievances]);

  const statusOptions = ["SUBMITTED", "AI_CLASSIFIED", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "REJECTED", "REOPENED"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">My Grievances</h1>
        <Link to="/citizen/grievances/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition">
          <Plus className="h-5 w-5" /> New Grievance
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" placeholder="Search by title, ticket ID, or category..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? <LoadingSpinner text="Loading grievances..." /> : grievances.length === 0 ? (
        <EmptyState icon={<FileText className="h-16 w-16" />} title="No grievances found" description="You haven't submitted any grievances yet." action={<Link to="/citizen/grievances/new" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition">Submit Grievance</Link>} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Ticket", "Title", "Category", "Status", "Priority", "Created"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3"><Link to={`/citizen/grievances/${g.id}`} className="font-mono text-xs text-white hover:underline">{g.ticketId}</Link></td>
                    <td className="px-4 py-3"><Link to={`/citizen/grievances/${g.id}`} className="font-medium text-white hover:text-gray-300 transition">{g.title.length > 40 ? g.title.slice(0, 40) + "..." : g.title}</Link></td>
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
              <p className="text-sm text-gray-500">Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4 inline" /> Prev</button>
                <span className="px-3 py-1.5 rounded-xl text-sm text-white">{page} / {meta.totalPages}</span>
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4 inline" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
