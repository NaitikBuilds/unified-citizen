import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  // Password strength checks (similar to CodeSarthi)
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (!password) return { text: "None", color: "text-gray-500", bar: "w-0" };
    if (strengthScore <= 1) return { text: "Weak", color: "text-red-400", bar: "w-1/4 bg-red-500" };
    if (strengthScore === 2) return { text: "Fair", color: "text-amber-400", bar: "w-2/4 bg-amber-500" };
    if (strengthScore === 3) return { text: "Good", color: "text-blue-400", bar: "w-3/4 bg-blue-500" };
    return { text: "Strong", color: "text-emerald-400", bar: "w-full bg-emerald-500" };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the Terms & Privacy Policy to register.");
      return;
    }
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) {
      toast.error("Please provide your name.");
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
        Create Account
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        Enter your details to join the transparent citizen governance ecosystem!
      </p>

      {/* Continue with Google */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => toast.info("Google OAuth registration initialized")}
          className="w-full py-3.5 px-4 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-lg shadow-white/5 active:scale-[0.99]"
        >
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
        <span className="relative px-4 text-xs font-semibold uppercase text-gray-500 bg-[#050508]">
          OR
        </span>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields (First & Last) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#aaa' }}>
              First Name <span style={{ color: '#888' }}>*</span>
            </label>
            <div className="relative flex items-center rounded-2xl transition" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pl-4 text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Aarav"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full py-3.5 px-3 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#aaa' }}>
              Last Name <span style={{ color: '#888' }}>*</span>
            </label>
            <div className="relative flex items-center rounded-2xl transition" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                type="text"
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full py-3.5 px-4 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

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
              placeholder="aarav.sharma@example.com"
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
              minLength={6}
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

        {/* Password Strength Checklist (CodeSarthi Style) */}
        <div className="p-4 rounded-2xl space-y-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Password strength:</span>
            <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
          </div>
          {/* Strength Bar */}
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strength.bar}`} />
          </div>
          {/* Criteria Indicators */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              {hasMinLength ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className={hasMinLength ? "text-gray-200" : ""}>At least 6 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasUppercase ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className={hasUppercase ? "text-gray-200" : ""}>One uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasNumber ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className={hasNumber ? "text-gray-200" : ""}>One number</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasSpecial ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className={hasSpecial ? "text-gray-200" : ""}>One special symbol</span>
            </div>
          </div>
        </div>

        {/* Agreement Toggle Switch (CodeSarthi Style) */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`w-9 h-5 rounded-full p-0.5 transition`}
            style={{ background: agreed ? '#fff' : 'rgba(255,255,255,0.15)' }}
          >
            <div
              className={`w-4 h-4 rounded-full transition-transform ${
                agreed ? "translate-x-4" : "translate-x-0"
              }`}
              style={{ background: agreed ? '#000' : '#fff' }}
            />
          </button>
          <span className="text-xs text-gray-400">
            I agree to the <span className="text-white hover:underline cursor-pointer">Terms & Conditions</span> and{" "}
            <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
          </span>
        </div>

        {/* Big White Pill Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition shadow-sm active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login Link */}
      <div className="text-center text-xs text-gray-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-white hover:opacity-70 font-semibold underline underline-offset-2">
          Sign In
        </Link>
      </div>
    </div>
  );
}
