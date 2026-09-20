import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import { userApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import type { User } from "../../types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { userApi.list(1, 100).then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const roleLabel: Record<string, string> = { CITIZEN: "Citizen", OFFICER: "Officer", DEPARTMENT_ADMIN: "Dept Admin", SUPER_ADMIN: "Super Admin" };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Team Members</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? <EmptyState icon={<Users className="h-16 w-16" />} title="No team members found" description="No officers are assigned to your department yet." /> : (
        <div className="overflow-x-auto rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Name", "Email", "Role", "Joined"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-lg text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{roleLabel[u.role] || u.role}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
