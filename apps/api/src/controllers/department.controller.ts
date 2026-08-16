import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";

// GET /api/departments
export async function getAllDepartments(
  req: Request,
  res: Response,
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
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/departments/:id
export async function getDepartmentById(
  req: Request,
  res: Response,
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
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: POST /api/departments
export async function createDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, description, code } = req.body;

    if (!name) {
      res.status(400).json({ error: "Department name is required" });
      return;
    }

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

    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: PATCH /api/departments/:id
export async function updateDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Admin: DELETE /api/departments/:id
export async function deleteDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id as string;

    await prisma.department.delete({
      where: { id },
    });

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
