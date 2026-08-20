import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { departmentApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { toast } from "sonner";
import type { Department } from "../../types";

const S = { bg: "#111", border: "1px solid rgba(255,255,255,0.07)" };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => { try { const { data } = await departmentApi.list(); setDepartments(data.departments); } catch { /* */ } finally { setLoading(false); } };
  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try { await departmentApi.create({ name: form.name, code: form.code || undefined, description: form.description || undefined }); toast.success("Department created"); setForm({ name: "", code: "", description: "" }); setShowForm(false); fetchDepartments(); } catch { toast.error("Failed to create department"); }
  };
  const handleUpdate = async (id: string) => {
    try { await departmentApi.update(id, { name: form.name || undefined, description: form.description || undefined }); toast.success("Department updated"); setEditing(null); setForm({ name: "", code: "", description: "" }); fetchDepartments(); } catch { toast.error("Failed to update department"); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this department?")) return;
    try { await departmentApi.delete(id); toast.success("Department deactivated"); fetchDepartments(); } catch { toast.error("Failed to deactivate"); }
  };

  if (loading) return <LoadingSpinner />;

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none";
  const inputStyle = { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Departments</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", code: "", description: "" }); }}>
          <Plus className="h-4 w-4" /> New Department
        </button>
      </div>
      {showForm && (
        <div className="rounded-2xl p-5 mb-6 space-y-3" style={S}>
          <h3 className="text-sm font-bold text-white">Create Department</h3>
          <input type="text" placeholder="Department name *" className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="text" placeholder="Code (auto-generated if empty)" className={inputCls} style={inputStyle} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <textarea placeholder="Description (optional)" className={`${inputCls} resize-none h-20`} style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition" onClick={handleCreate}>Create</button>
            <button className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {departments.length === 0 ? <EmptyState icon={<Building2 className="h-16 w-16" />} title="No departments" description="Create your first department to get started." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className={`rounded-2xl p-5 ${!d.isActive ? "opacity-60" : ""}`} style={S}>
              {editing === d.id ? (
                <div className="space-y-2">
                  <input type="text" className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <textarea className={`${inputCls} resize-none h-16`} style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div className="flex gap-1">
                    <button className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition" onClick={() => handleUpdate(d.id)}>Save</button>
                    <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white transition" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{d.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-lg font-mono text-gray-400" style={{ background: "rgba(255,255,255,0.05)" }}>{d.code}</span>
                  </div>
                  {d.description && <p className="text-sm text-gray-500 mb-3">{d.description}</p>}
                  <div className="flex gap-1">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition" onClick={() => { setEditing(d.id); setForm({ name: d.name, code: d.code, description: d.description || "" }); }}><Edit2 className="h-3 w-3" /> Edit</button>
                    {d.isActive && <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" onClick={() => handleDelete(d.id)}><Trash2 className="h-3 w-3" /> Deactivate</button>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
