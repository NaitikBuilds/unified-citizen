import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";
import { createAuditLog } from "../services/audit.service.js";

// GET /api/departments
export async function getAllDepartments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const departments = await prisma.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({ departments });
  } catch (error) {
    next(error);
  }
}

// GET /api/departments/:id
export async function getDepartmentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;

    const department = await prisma.department.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!department) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json({ department });
  } catch (error) {
    next(error);
  }
}

// Admin: POST /api/departments
export async function createDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, description, code } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        description,
        code:
          code ||
          name.slice(0, 3).toUpperCase() +
            Math.floor(100 + Math.random() * 900),
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      action: "CREATE_DEPARTMENT",
      newValue: {
        id: department.id,
        name: department.name,
        code: department.code,
      },
      metadata: { departmentId: department.id },
    });

    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    // Central handler maps Prisma P2002 (duplicate name/code) to 409.
    next(error);
  }
}

// Admin: PATCH /api/departments/:id
export async function updateDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const existing = await prisma.department.findUnique({
      where: { id },
      select: { id: true, name: true, code: true, description: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      action: "UPDATE_DEPARTMENT",
      oldValue: existing,
      newValue: {
        id: department.id,
        name: department.name,
        description: department.description,
      },
      metadata: { departmentId: id },
    });

    res.json({ message: "Department updated successfully", department });
  } catch (error) {
    next(error);
  }
}

// Admin: DELETE /api/departments/:id
// Admin: DELETE /api/departments/:id
export async function deleteDepartment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;

    const department = await prisma.department.findUnique({
      where: { id },
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
        error: "Department is already inactive",
      });
      return;
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      action: "DEACTIVATE_DEPARTMENT",
      oldValue: { id: department.id, isActive: true },
      newValue: { id: department.id, isActive: false },
      metadata: { departmentId: id },
    });

    res.json({
      message: "Department deactivated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
}
