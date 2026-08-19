import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { userApi } from "../../lib/api";
import { toast } from "sonner";
import { User, Mail, Shield, Building2, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.updateProfile(name);
      setUser(data.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Officer",
    DEPARTMENT_ADMIN: "Department Admin",
    SUPER_ADMIN: "Super Admin",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-4">
          <div className="flex items-center gap-3 text-base-content/60">
            <User className="h-5 w-5" />
            <div>
              <div className="text-xs uppercase tracking-wide">Name</div>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-base-content/60">
            <Mail className="h-5 w-5" />
            <div>
              <div className="text-xs uppercase tracking-wide">Email</div>
              <div className="font-medium text-base-content mt-1">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-base-content/60">
            <Shield className="h-5 w-5" />
            <div>
              <div className="text-xs uppercase tracking-wide">Role</div>
              <div className="badge badge-primary mt-1">{roleLabel[user?.role || ""]}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-base-content/60">
            <Building2 className="h-5 w-5" />
            <div>
              <div className="text-xs uppercase tracking-wide">Department</div>
              <div className="font-medium text-base-content mt-1">{user?.departmentId || "Not assigned"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-base-content/60">
            <Calendar className="h-5 w-5" />
            <div>
              <div className="text-xs uppercase tracking-wide">Member Since</div>
              <div className="font-medium text-base-content mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
          <div className="divider" />
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || name === user?.name}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
