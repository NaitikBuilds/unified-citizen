import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { grievanceApi } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import CategoryChip from "../../components/CategoryChip";
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
        <div>
          <h1 className="text-2xl font-bold text-white">My Grievances</h1>
          <p className="text-sm text-gray-500 mt-0.5">All your submitted grievances and their live status.</p>
        </div>
        <Link to="/citizen/grievances/new" className="btn-shine flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold">
          <Plus className="h-5 w-5" /> New Grievance
        </Link>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" placeholder="Search by title, ticket ID, or category..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none transition-all duration-200 focus:border-white/30" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all duration-200 focus:border-white/30 cursor-pointer" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? <LoadingSpinner text="Loading grievances..." /> : grievances.length === 0 ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="No grievances found" description="You haven't submitted any grievances yet." action={<Link to="/citizen/grievances/new" className="btn-shine inline-flex px-4 py-2 rounded-xl bg-white text-black text-sm font-bold">Submit Grievance</Link>} />
      ) : (
        <>
          <div className="dark-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Ticket", "Title", "Category", "Status", "Priority", "Created"].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((g) => (
                    <tr key={g.id} className="group hover:bg-white/[0.04] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3.5"><Link to={`/citizen/grievances/${g.id}`} className="font-mono text-xs text-gray-400 group-hover:text-white transition-colors">{g.ticketId}</Link></td>
                      <td className="px-4 py-3.5 max-w-[220px]"><Link to={`/citizen/grievances/${g.id}`} className="font-medium text-white hover:text-gray-300 transition-colors">{g.title.length > 40 ? g.title.slice(0, 40) + "..." : g.title}</Link></td>
                      <td className="px-4 py-3.5"><CategoryChip category={g.category} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={g.status} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={g.priority} /></td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
              <div className="flex items-center gap-1.5">
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4 inline" /> Prev</button>
                <span className="px-3.5 py-1.5 rounded-xl text-sm text-white font-semibold" style={{ background: "rgba(255,255,255,0.07)" }}>{page} / {meta.totalPages}</span>
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4 inline" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
