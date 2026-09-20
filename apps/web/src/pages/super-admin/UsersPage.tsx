import { useState, useEffect, useCallback } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { userApi, departmentApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { toast } from "sonner";
import type { User, Department, PaginationMeta } from "../../types";

const S = { bg: "#111", border: "1px solid rgba(255,255,255,0.07)", inputBg: "#111", inputBorder: "1px solid rgba(255,255,255,0.1)" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const { data } = await userApi.list(page, 15); setUsers(data.users); setMeta(data.meta); } catch { /* */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); departmentApi.list().then(({ data }) => setDepartments(data.departments)).catch(() => {}); }, [fetchUsers]);

  const filtered = search ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : users;
  const roleLabel: Record<string, string> = { CITIZEN: "Citizen", OFFICER: "Officer", DEPARTMENT_ADMIN: "Dept Admin", SUPER_ADMIN: "Super Admin" };

  const handleUpdateUser = async (userId: string) => {
    try { const update: { role?: string; departmentId?: string | null } = {}; if (editRole) update.role = editRole; if (editDept !== "") update.departmentId = editDept || null; await userApi.updateRoleOrDept(userId, update); toast.success("User updated"); setEditingUser(null); fetchUsers(); } catch { toast.error("Failed to update user"); }
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={S.inputBg ? { background: S.inputBg, border: S.inputBorder } : {}} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? <EmptyState icon={<Users className="h-16 w-16" />} title="No users found" /> : (
        <>
          <div className="overflow-x-auto rounded-2xl" style={S}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Name", "Email", "Role", "Department", "Joined", ""].map((h) => <th key={h + Math.random()} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <select className="px-2 py-1 rounded-lg text-sm text-white focus:outline-none" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                          {Object.entries(roleLabel).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                        </select>
                      ) : <span className="text-xs px-2 py-1 rounded-lg text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{roleLabel[u.role] || u.role}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <select className="px-2 py-1 rounded-lg text-sm text-white focus:outline-none" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} value={editDept} onChange={(e) => setEditDept(e.target.value)}>
                          <option value="">None</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      ) : <span className="text-sm text-gray-300">{departments.find((d) => d.id === u.departmentId)?.name || "—"}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <div className="flex gap-1">
                          <button className="px-2 py-1 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition" onClick={() => handleUpdateUser(u.id)}>Save</button>
                          <button className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition" onClick={() => setEditingUser(null)}>Cancel</button>
                        </div>
                      ) : <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition" onClick={() => { setEditingUser(u.id); setEditRole(u.role); setEditDept(u.departmentId || ""); }}><Edit2 className="h-3.5 w-3.5" /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={S.inputBorder ? { border: S.inputBorder } : {}} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4 inline" /></button>
                <button className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition disabled:opacity-30" style={S.inputBorder ? { border: S.inputBorder } : {}} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4 inline" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
