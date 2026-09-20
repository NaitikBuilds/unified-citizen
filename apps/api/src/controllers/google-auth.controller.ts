import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../services/prisma.service.js";
import { createAuditLog } from "../services/audit.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwt.service.js";

// Google exposes the same tokeninfo endpoint on two hosts. Some networks
// (ISPs with broken DNS filters) fail to resolve oauth2.googleapis.com, so
// we fall back to www.googleapis.com before giving up.
const GOOGLE_TOKENINFO_URLS = [
  "https://oauth2.googleapis.com/tokeninfo?access_token=",
  "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=",
];

const TOKENINFO_TIMEOUT_MS = 5000;

interface GoogleTokenInfo {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  exp?: string;
  error_description?: string;
}

/**
 * Verifies a Google access token issued by Google Identity Services and
 * returns the identity of the user it belongs to. Validates audience,
 * expiry and email verification — never trust the client's claims alone.
 */
async function verifyGoogleToken(
  accessToken: string
): Promise<{ googleId: string; email: string; name: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google login is not configured on the server");
  }

  let info: GoogleTokenInfo | undefined;
  let lastNetworkError: unknown;

  for (const tokenInfoUrl of GOOGLE_TOKENINFO_URLS) {
    let res: globalThis.Response;
    try {
      res = await fetch(`${tokenInfoUrl}${accessToken}`, {
        signal: AbortSignal.timeout(TOKENINFO_TIMEOUT_MS),
      });
    } catch (fetchError) {
      // DNS/network failure or timeout — try the next host.
      lastNetworkError = fetchError;
      continue;
    }

    if (res.status >= 500) {
      // Transient Google-side error — try the next host.
      lastNetworkError = new Error(`tokeninfo responded ${res.status}`);
      continue;
    }

    if (!res.ok) {
      // Google definitively answered: the token is invalid or expired.
      throw new Error("Invalid or expired Google token");
    }

    info = (await res.json()) as GoogleTokenInfo;
    break;
  }

  if (!info) {
    console.error(
      "Google tokeninfo endpoints unreachable:",
      lastNetworkError instanceof Error
        ? lastNetworkError.message
        : lastNetworkError
    );
    throw new Error("Could not verify Google token");
  }

  const isAudValid = info.aud === clientId;
  const isNotExpired = info.exp ? Number(info.exp) * 1000 > Date.now() : false;
  const emailVerified =
    info.email_verified === true || info.email_verified === "true";

  if (
    !isAudValid ||
    !isNotExpired ||
    !info.sub ||
    !info.email ||
    !emailVerified
  ) {
    throw new Error("Invalid Google token");
  }

  return {
    googleId: info.sub,
    email: info.email.toLowerCase(),
    name: info.name || info.email.split("@")[0],
  };
}

/**
 * POST /api/v1/auth/google
 * Body: { accessToken } — a Google access token obtained via Google Identity
 * Services on the frontend. Signs the user in, creating the account on first
 * login (always with the CITIZEN role).
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { accessToken } = req.body as { accessToken?: string };
    if (!accessToken) {
      res.status(400).json({ error: "Google access token is required" });
      return;
    }

    let identity;
    try {
      identity = await verifyGoogleToken(accessToken);
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      const message =
        verifyError instanceof Error && verifyError.message.startsWith("Google login is not configured")
          ? "Google login is not configured on the server"
          : "Google sign-in could not be verified. Please try again.";
      res.status(401).json({ error: message });
      return;
    }

    const user = await prisma.user.upsert({
      where: { email: identity.email },
      update: {}, // do not override roles/departments set by admins
      create: {
        email: identity.email,
        // Google users sign in via Google; the account still needs a
        // password hash value to satisfy the schema.
        passwordHash: crypto.randomBytes(32).toString("hex"),
        name: identity.name,
        role: "CITIZEN",
        departmentId: null,
      },
    });

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      departmentId: user.departmentId,
    };

    const accessTokenJwt = generateAccessToken(tokenPayload);
    const refreshTokenRaw = generateRefreshToken(user.id);

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshTokenRaw)
      .digest("hex");

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      metadata: { method: "google" },
    });

    res.status(200).json({
      accessToken: accessTokenJwt,
      refreshToken: refreshTokenRaw,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
