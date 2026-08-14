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