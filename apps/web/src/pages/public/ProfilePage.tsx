import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { userApi, authApi } from "../../lib/api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Lock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSaveName = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.updateProfile(name);
      setUser(data.user);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Officer",
    DEPARTMENT_ADMIN: "Department Admin",
    SUPER_ADMIN: "Super Admin",
  };

  const roleColors: Record<string, string> = {
    CITIZEN: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    OFFICER: "bg-green-500/20 text-green-400 border border-green-500/30",
    DEPARTMENT_ADMIN: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    SUPER_ADMIN: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">


      <div>
        {/* Header */}
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your account settings</p>
        </div>

        {/* ===== PROFILE CARD ===== */}
        <div className="rounded-3xl p-6 mb-6" style={{ background: "#111", border: "1px solid #222" }}>
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-6" style={{ borderBottom: "1px solid #222" }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user?.role || ""]}`}>
                {roleLabel[user?.role || ""]}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                <User className="h-3.5 w-3.5 inline mr-1.5" />
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                style={{ background: "#1a1a1a", border: "1px solid #333" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed"
                style={{ background: "#1a1a1a", border: "1px solid #333" }}
                value={user?.email}
                disabled
              />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  <Shield className="h-3.5 w-3.5 inline mr-1.5" />
                  Role
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed"
                  style={{ background: "#1a1a1a", border: "1px solid #333" }}
                  value={roleLabel[user?.role || ""]}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  <Building2 className="h-3.5 w-3.5 inline mr-1.5" />
                  Department
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed"
                  style={{ background: "#1a1a1a", border: "1px solid #333" }}
                  value={user?.departmentId ? "Assigned" : "Not Assigned"}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                Member Since
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed"
                style={{ background: "#1a1a1a", border: "1px solid #333" }}
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"
                }
                disabled
              />
            </div>

            <button
              className="w-full py-3.5 rounded-xl font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "white" }}
              onClick={handleSaveName}
              disabled={loading || name === user?.name}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ===== CHANGE PASSWORD CARD ===== */}
        <div className="rounded-3xl p-6 mb-6" style={{ background: "#111", border: "1px solid #222" }}>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            Change Password
          </h3>
          <p className="text-gray-500 text-sm mb-6 ml-12">
            Update your password to keep your account secure
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  style={{ background: "#1a1a1a", border: "1px solid #333" }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  style={{ background: "#1a1a1a", border: "1px solid #333" }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                style={{ background: "#1a1a1a", border: "1px solid #333" }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "#1a1a1a", border: "1px solid #333" }}
              onClick={handleChangePassword}
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {passwordLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Changing Password...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ===== ACCOUNT INFO CARD ===== */}
        <div className="rounded-3xl p-6" style={{ background: "#111", border: "1px solid #222" }}>
          <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm" style={{ borderTop: "1px solid #222", paddingTop: "16px" }}>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Account Status</span>
              <p className="text-white font-medium mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Active
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">User ID</span>
              <p className="text-gray-400 font-medium mt-1 font-mono text-xs break-all">{user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
