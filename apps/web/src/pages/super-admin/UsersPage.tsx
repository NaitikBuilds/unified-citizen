import { useState, useEffect, useCallback } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { userApi, departmentApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { toast } from "sonner";
import type { User, Department, PaginationMeta } from "../../types";

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
    try {
      const { data } = await userApi.list(page, 15);
      setUsers(data.users);
      setMeta(data.meta);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
    departmentApi
      .list()
      .then(({ data }) => setDepartments(data.departments))
      .catch(() => {});
  }, [fetchUsers]);

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Officer",
    DEPARTMENT_ADMIN: "Dept Admin",
    SUPER_ADMIN: "Super Admin",
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      const update: { role?: string; departmentId?: string | null } = {};
      if (editRole) update.role = editRole;
      if (editDept !== "") update.departmentId = editDept || null;
      await userApi.updateRoleOrDept(userId, update);
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="input-group mb-6">
        <span>
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search users..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-16 w-16" />}
          title="No users found"
        />
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="hover">
                    <td className="font-medium">{u.name}</td>
                    <td className="text-sm text-base-content/60">
                      {u.email}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <select
                          className="select select-bordered select-sm"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                        >
                          {Object.entries(roleLabel).map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-outline badge-sm">
                          {roleLabel[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <select
                          className="select select-bordered select-sm"
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                        >
                          <option value="">None</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm">
                          {departments.find((d) => d.id === u.departmentId)
                            ?.name || "—"}
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => handleUpdateUser(u.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditingUser(u.id);
                            setEditRole(u.role);
                            setEditDept(u.departmentId || "");
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-base-content/60">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
