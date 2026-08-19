import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../services/prisma.service.js";
import { createAuditLog } from "../services/audit.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/jwt.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      res.status(409).json({
        error: "An account with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name: normalizedName,
        role: "CITIZEN",
        departmentId: null,
      },
      select: {
        id: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "USER_REGISTERED",
      newValue: { role: "CITIZEN" },
      metadata: { email: normalizedEmail },
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Register error:", error);

    // Prisma unique-constraint violation
    if (error?.code === "P2002") {
      res.status(409).json({
        error: "An account with this email already exists",
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      departmentId: user.departmentId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenRaw = generateRefreshToken(user.id);

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshTokenRaw)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      metadata: { method: "password" },
    });

    res.status(200).json({
      accessToken,
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
    console.error("Login error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Use a transaction to safely lock and update token rotation atomically
    const result = await prisma.$transaction(async (tx) => {
      const storedToken = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (
        !storedToken ||
        storedToken.userId !== payload.userId ||
        storedToken.expiresAt <= new Date()
      ) {
        throw new Error("Invalid or expired refresh token");
      }

      // Handle already revoked token (Grace period check for concurrent race conditions)
      if (storedToken.revokedAt) {
        const timeSinceRevocation =
          Date.now() - new Date(storedToken.revokedAt).getTime();
        const GRACE_PERIOD_MS = 10000; // 10 seconds grace period for concurrent requests

        if (timeSinceRevocation < GRACE_PERIOD_MS) {
          const activeUser = await tx.user.findUnique({
            where: { id: payload.userId },
          });
          if (!activeUser) throw new Error("User not found");

          const accessToken = generateAccessToken({
            userId: activeUser.id,
            role: activeUser.role,
            email: activeUser.email,
            departmentId: activeUser.departmentId,
          });

          return { accessToken, refreshToken: null };
        }

        // Past grace period: Potential token theft/replay attack detected! Revoke all tokens for user.
        await tx.refreshToken.updateMany({
          where: { userId: payload.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new Error(
          "Security alert: Token reuse detected. Session terminated.",
        );
      }

      // Normal rotation: Revoke current token and issue new pair
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const user = await tx.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw new Error("User not found");

      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        departmentId: user.departmentId,
      });

      const newRefreshTokenRaw = generateRefreshToken(user.id);
      const newTokenHash = crypto
        .createHash("sha256")
        .update(newRefreshTokenRaw)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await tx.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      return { accessToken, refreshToken: newRefreshTokenRaw };
    });

    res.json({
      accessToken: result.accessToken,
      ...(result.refreshToken && { refreshToken: result.refreshToken }),
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      if (!req.user) {
        res.status(401).json({
          error: "Unauthorized",
        });
        return;
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          userId: req.user.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } else if (req.user) {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    if (req.user) {
      await createAuditLog({
        userId: req.user.userId,
        action: "LOGOUT",
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
