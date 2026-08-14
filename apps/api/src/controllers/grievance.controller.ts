import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../services/prisma.service.js';

// POST /api/grievances
export async function createGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, description, category, departmentId, latitude, longitude, address } = req.body;

    if (!title || !description || !category || !departmentId) {
      res.status(400).json({ error: 'Missing required fields: title, description, category, departmentId' });
      return;
    }

    const grievance = await prisma.grievance.create({
      data: {
        title,
        description,
        category,
        departmentId,
        citizenId: req.user.userId,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address: address || null,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ message: 'Grievance created successfully', grievance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/grievances
export async function getGrievances(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;
    const departmentId = req.user.departmentId;
    let grievances;

    if (role === 'Citizen') {
      grievances = await prisma.grievance.findMany({
        where: { citizenId: userId },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'Department Officer' || role === 'Department Admin') {
      grievances = await prisma.grievance.findMany({
        where: { departmentId: departmentId ?? undefined },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'Super Admin' || role === 'Verifier') {
      grievances = await prisma.grievance.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({ grievances });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/grievances/:id
export async function getGrievanceById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const grievance = await prisma.grievance.findUnique({
      where: { id },
      include: {
        citizen: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;
    const departmentId = req.user.departmentId;

    // Authorization checks
    if (role === 'Citizen' && grievance.citizenId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    if ((role === 'Department Officer' || role === 'Department Admin') && grievance.departmentId !== departmentId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({ grievance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}