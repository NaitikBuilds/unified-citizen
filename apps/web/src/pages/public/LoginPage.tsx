import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

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
        <button
          type="button"
          onClick={() => toast.info("Google OAuth login initialized")}
          className="w-full py-3.5 px-4 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-sm active:scale-[0.99]"
        >
          {/* Google Color SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
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
            New to Unified Citizen?{" "}
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
          <button
            type="button"
            onClick={() => handleQuickDemo("citizen@demo.com", "password123")}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition border border-white/[0.06]"
          >
            Citizen Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("officer@demo.com", "password123")}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition border border-white/[0.06]"
          >
            Officer Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("admin@demo.com", "password123")}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition border border-white/[0.06]"
          >
            Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}
