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

  useEffect(() => {
    userApi
      .list(1, 100)
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Officer",
    DEPARTMENT_ADMIN: "Dept Admin",
    SUPER_ADMIN: "Super Admin",
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Members</h1>

      <div className="input-group mb-6">
        <span>
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-16 w-16" />}
          title="No team members found"
          description="No officers are assigned to your department yet."
        />
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover">
                  <td className="font-medium">{u.name}</td>
                  <td className="text-sm text-base-content/60">{u.email}</td>
                  <td>
                    <span className="badge badge-outline badge-sm">
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/60">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
