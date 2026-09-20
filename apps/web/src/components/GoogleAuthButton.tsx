import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

const DASHBOARD_ROUTES: Record<string, string> = {
  CITIZEN: "/citizen/dashboard",
  OFFICER: "/officer/dashboard",
  DEPARTMENT_ADMIN: "/dept-admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

interface GoogleAuthButtonProps {
  /** "signup" shows a friendlier welcome message on first-time Google users */
  mode: "login" | "signup";
}

/**
 * "Continue with Google" button used on the Login and Register pages.
 *
 * Opens the Google account chooser (Google Identity Services token flow),
 * sends the resulting access token to `POST /api/v1/auth/google`, and signs
 * the user in — creating the account automatically on first use. Existing
 * email/password accounts with the same verified Google email are linked.
 */
export default function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const { promptGoogle } = useGoogleAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const accessToken = await promptGoogle();
      setIsSigningIn(true);
      await loginWithGoogle(accessToken);
      toast.success(
        mode === "signup"
          ? "Account ready! Welcome to CIVIX."
          : "Logged in successfully"
      );
      const user = useAuthStore.getState().user;
      navigate(DASHBOARD_ROUTES[user?.role || ""] || "/");
    } catch (err: unknown) {
      const apiError = (
        err as { response?: { data?: { error?: string } } }
      )?.response?.data?.error;
      const rawMessage = err instanceof Error ? err.message : "";
      console.error("[GoogleAuth] Sign-in failed:", err);
      const msg =
        apiError ||
        rawMessage ||
        "Google sign-in failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isSigningIn}
      className="w-full py-3.5 px-4 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-sm active:scale-[0.99] disabled:opacity-60"
    >
      {isSigningIn ? (
        <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
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
        </>
      )}
    </button>
  );
}
