import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../services/prisma.service.js';

// GET /api/users/me
export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/users/me
export async function updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { ...(name && { name }) },
      select: { id: true, name: true, email: true, role: true, departmentId: true },
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: GET /api/users
export async function getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true },
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: GET /api/users/:id
export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: PATCH /api/users/:id
export async function updateUserRoleOrDept(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, departmentId } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(departmentId !== undefined && { departmentId }),
      },
      select: { id: true, name: true, email: true, role: true, departmentId: true },
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}