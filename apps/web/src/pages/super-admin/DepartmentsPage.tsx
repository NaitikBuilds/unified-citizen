import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { departmentApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { toast } from "sonner";
import type { Department } from "../../types";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.departments);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await departmentApi.create({
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
      });
      toast.success("Department created");
      setForm({ name: "", code: "", description: "" });
      setShowForm(false);
      fetchDepartments();
    } catch {
      toast.error("Failed to create department");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await departmentApi.update(id, {
        name: form.name || undefined,
        description: form.description || undefined,
      });
      toast.success("Department updated");
      setEditing(null);
      setForm({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch {
      toast.error("Failed to update department");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this department?")) return;
    try {
      await departmentApi.delete(id);
      toast.success("Department deactivated");
      fetchDepartments();
    } catch {
      toast.error("Failed to deactivate");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({ name: "", code: "", description: "" });
          }}
        >
          <Plus className="h-4 w-4" /> New Department
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
          <div className="card-body gap-3">
            <h3 className="card-title text-sm">Create Department</h3>
            <input
              type="text"
              placeholder="Department name *"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Code (auto-generated if empty)"
              className="input input-bordered w-full"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              className="textarea textarea-bordered w-full"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                Create
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {departments.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-16 w-16" />}
          title="No departments"
          description="Create your first department to get started."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div
              key={d.id}
              className={`card bg-base-100 shadow-sm border ${
                d.isActive ? "border-base-300" : "border-error/30 opacity-60"
              }`}
            >
              <div className="card-body p-4">
                {editing === d.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                    <textarea
                      className="textarea textarea-bordered textarea-sm"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                    <div className="flex gap-1">
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => handleUpdate(d.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{d.name}</h3>
                      <span className="badge badge-sm badge-outline font-mono">
                        {d.code}
                      </span>
                    </div>
                    {d.description && (
                      <p className="text-sm text-base-content/60">
                        {d.description}
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setEditing(d.id);
                          setForm({
                            name: d.name,
                            code: d.code,
                            description: d.description || "",
                          });
                        }}
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      {d.isActive && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(d.id)}
                        >
                          <Trash2 className="h-3 w-3" /> Deactivate
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
