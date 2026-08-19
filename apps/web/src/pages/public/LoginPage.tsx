import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      // Navigate based on role
      const user = useAuthStore.getState().user;
      const routes: Record<string, string> = {
        CITIZEN: "/citizen/dashboard",
        OFFICER: "/officer/dashboard",
        DEPARTMENT_ADMIN: "/dept-admin/dashboard",
        SUPER_ADMIN: "/admin/dashboard",
      };
      navigate(routes[user?.role || ""] || "/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="card-title text-2xl justify-center mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            placeholder="••••••"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className={`btn btn-primary w-full mt-2 ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="divider">OR</div>
      <p className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="link link-primary font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
