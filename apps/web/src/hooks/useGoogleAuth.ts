import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GoogleTokenClient,
  GoogleTokenResponse,
} from "../types/google-identity-services";

const POPUP_CLOSE_GRACE_MS = 2000;

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
  settled: boolean;
  closeTimer: number | undefined;
}

/**
 * Google Identity Services (token flow) hook.
 *
 * Returns `promptGoogle()`, which opens the Google account chooser / consent
 * screen in a popup and resolves with the user's Google access token. The
 * token must be verified server-side before it can be trusted.
 */
export function useGoogleAuth() {
  const [isReady, setIsReady] = useState(false);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!clientId) {
      // Google login not configured (e.g. missing .env) — the button will
      // show a helpful toast instead of silently doing nothing.
      console.warn(
        "[GoogleAuth] VITE_GOOGLE_CLIENT_ID is not set — Google login disabled."
      );
      return;
    }

    let cancelled = false;
    let interval: number | undefined;
    let timeout: number | undefined;

    const settlePending = () => {
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending?.closeTimer !== undefined) {
        window.clearTimeout(pending.closeTimer);
      }
      return pending;
    };

    const init = () => {
      if (cancelled || !window.google) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response: GoogleTokenResponse) => {
          const pending = settlePending();
          if (response.access_token) {
            console.info("[GoogleAuth] Google token received");
            pending?.resolve(response.access_token);
          } else {
            console.warn("[GoogleAuth] Token flow error:", response.error);
            pending?.reject(
              new Error(
                response.error === "access_denied"
                  ? "Google sign-in was cancelled"
                  : response.error || "Google sign-in failed"
              )
            );
          }
        },
        error_callback: (error) => {
          const pending = pendingRef.current;
          if (!pending || pending.settled) return;

          if (error.type === "popup_closed" || error.type === "popup_blocked") {
            // Known GIS race: the popup can report "closed" while the token
            // is still being delivered. Wait briefly for the real callback
            // before giving up.
            console.warn("[GoogleAuth] popup closed — waiting for token…");
            pending.closeTimer = window.setTimeout(() => {
              const stillPending = settlePending();
              stillPending?.reject(
                new Error("Google sign-in popup was closed before completing")
              );
            }, POPUP_CLOSE_GRACE_MS);
            return;
          }

          const settled = settlePending();
          settled?.reject(
            new Error(error.message || "Google sign-in failed")
          );
        },
      });
      setIsReady(true);
      console.info("[GoogleAuth] Google Identity Services ready");
    };

    // The GIS script is loaded with `async defer` in index.html; wait for it.
    if (window.google?.accounts?.oauth2) {
      init();
    } else {
      const onWindowLoad = () => init();
      window.addEventListener("load", onWindowLoad);
      // The script may finish loading after the window load event.
      interval = window.setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          window.clearInterval(interval);
          init();
        }
      }, 200);
      timeout = window.setTimeout(() => {
        window.clearInterval(interval);
      }, 10000);

      return () => {
        cancelled = true;
        if (interval !== undefined) window.clearInterval(interval);
        if (timeout !== undefined) window.clearTimeout(timeout);
        window.removeEventListener("load", onWindowLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const promptGoogle = useCallback((): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
        | string
        | undefined;
      if (!clientId || !tokenClientRef.current) {
        reject(
          new Error(
            "Google login is not configured. Set VITE_GOOGLE_CLIENT_ID (frontend) and GOOGLE_CLIENT_ID (backend) in your .env files, then restart both servers."
          )
        );
        return;
      }
      pendingRef.current = { resolve, reject, settled: false, closeTimer: undefined };
      tokenClientRef.current.requestAccessToken();
    });
  }, []);

  return { promptGoogle, isReady };
}
