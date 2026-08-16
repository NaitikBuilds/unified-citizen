import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";

// GET /api/users/me
export async function getMyProfile(
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

// PATCH /api/users/me
export async function updateMyProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { ...(name && { name }) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: GET /api/users
export async function getAllUsers(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const where =
      req.user.role === "DEPARTMENT_ADMIN"
        ? { departmentId: req.user.departmentId ?? undefined }
        : {};

    if (req.user.role === "DEPARTMENT_ADMIN" && !req.user.departmentId) {
      res.status(403).json({
        error: "Forbidden: Department admin is not assigned to a department",
      });
      return;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        createdAt: true,
      },
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: GET /api/users/:id
export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (req.user.role === "DEPARTMENT_ADMIN") {
      if (!req.user.departmentId) {
        res.status(403).json({
          error: "Forbidden: Department admin is not assigned to a department",
        });
        return;
      }

      if (user.departmentId !== req.user.departmentId) {
        res.status(403).json({
          error: "Forbidden: User belongs to another department",
        });
        return;
      }
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: PATCH /api/users/:id
export async function updateUserRoleOrDept(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const id = req.params.id as string;
    const { role, departmentId } = req.body ?? {};

    if (role === undefined && departmentId === undefined) {
      res.status(400).json({
        error: "At least one of role or departmentId is required",
      });
      return;
    }

    const validRoles = [
      "CITIZEN",
      "OFFICER",
      "DEPARTMENT_ADMIN",
      "SUPER_ADMIN",
    ] as const;

    if (role !== undefined && !validRoles.includes(role)) {
      res.status(400).json({
        error: "Invalid user role",
      });
      return;
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      typeof departmentId !== "string"
    ) {
      res.status(400).json({
        error: "Invalid departmentId",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        departmentId: true,
      },
    });

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (departmentId !== undefined && departmentId !== null) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!department) {
        res.status(404).json({ error: "Department not found" });
        return;
      }

      if (!department.isActive) {
        res.status(400).json({
          error: "Cannot assign user to an inactive department",
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(departmentId !== undefined && { departmentId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
