import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const DEMO_ACCOUNTS = [
  { label: "Citizen Demo", email: "citizen1@example.com", password: "Citizen@12345" },
  { label: "Officer Demo", email: "officer.pwd@unifiedcitizen.gov.in", password: "Officer@12345" },
  { label: "Department Admin", email: "admin.pwd@unifiedcitizen.gov.in", password: "Admin@12345" },
  { label: "Super Admin", email: "admin@unifiedcitizen.gov.in", password: "Admin@12345" },
] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      const user = useAuthStore.getState().user;
      const routes: Record<string, string> = {
        CITIZEN: "/citizen/dashboard",
        OFFICER: "/officer/dashboard",
        DEPARTMENT_ADMIN: "/dept-admin/dashboard",
        SUPER_ADMIN: "/admin/dashboard",
      };
      navigate(routes[user?.role || ""] || "/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
        Welcome Back!
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        Enter your credentials to access your governance workspace.
      </p>

      {/* Continue with Google Button */}
      <div className="mt-6">
        <GoogleAuthButton mode="login" />
      </div>

      {/* OR Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
          <span className="relative px-4 text-xs font-semibold uppercase" style={{ color: '#555', background: '#000' }}>
          OR
        </span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#aaa' }}>
            Email ID <span style={{ color: '#888' }}>*</span>
          </label>
          <div className="relative flex items-center rounded-2xl transition" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="pl-4 text-gray-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="citizen@unified.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-3.5 px-3 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#aaa' }}>
            Password <span style={{ color: '#888' }}>*</span>
          </label>
          <div className="relative flex items-center rounded-2xl transition" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="pl-4 text-gray-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3.5 px-3 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-gray-500 hover:text-gray-300 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation & Help Links */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <div>
            New to CIVIX?{" "}
            <Link to="/register" className="text-white hover:opacity-70 font-semibold underline underline-offset-2">
              Sign Up
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Password reset instructions sent to your email.")}
            className="text-gray-400 hover:text-white transition"
          >
            Forgot password?
          </button>
        </div>

        {/* Big White Pill Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition shadow-sm active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Demo Credentials Assistant */}
      <div className="mt-8 p-4 rounded-2xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold mb-2.5" style={{ color: '#aaa' }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo Logins</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleQuickDemo(account.email, account.password)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition border border-white/[0.06]"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
