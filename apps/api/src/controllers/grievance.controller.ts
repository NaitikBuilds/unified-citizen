import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../services/prisma.service.js';
import { createSLAForGrievance } from '../services/sla.service.js';

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

    // Automatically create SLA for the new grievance
    await createSLAForGrievance(grievance.id, departmentId, grievance.priority);

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

// PATCH /api/grievances/:id
export async function updateGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, category, departmentId, latitude, longitude, address } = req.body;

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen' && grievance.citizenId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedGrievance = await prisma.grievance.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(departmentId && { departmentId }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(address !== undefined && { address }),
      },
    });

    res.json({ message: 'Grievance updated successfully', grievance: updatedGrievance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/grievances/:id/status
export async function updateGrievanceStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Missing required field: status' });
      return;
    }

    const role = req.user.role;
    const departmentId = req.user.departmentId;

    if (role === 'Citizen') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    if ((role === 'Department Officer' || role === 'Department Admin') && grievance.departmentId !== departmentId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedGrievance = await prisma.grievance.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Grievance status updated successfully', grievance: updatedGrievance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen') {
      if (grievance.citizenId !== userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      if (grievance.status !== 'SUBMITTED') {
        res.status(400).json({ error: 'Cannot delete grievance after it has been processed' });
        return;
      }
    }

    await prisma.grievance.delete({ where: { id } });

    res.json({ message: 'Grievance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function assignGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { officerId } = req.body;

    if (!officerId) {
      res.status(400).json({ error: 'Missing required field: officerId' });
      return;
    }

    const role = req.user.role;
    const userDepartmentId = req.user.departmentId;

    if (role !== 'Department Admin' && role !== 'Super Admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    if (role === 'Department Admin' && grievance.departmentId !== userDepartmentId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const officer = await prisma.user.findUnique({ where: { id: officerId } });
    if (!officer) {
      res.status(404).json({ error: 'Officer not found' });
      return;
    }

    const updatedGrievance = await prisma.grievance.update({
      where: { id },
      data: { 
        assignedOfficerId: officerId,
        status: grievance.status === 'SUBMITTED' ? 'IN_PROGRESS' : grievance.status 
      },
    });

    res.json({ message: 'Grievance assigned successfully', grievance: updatedGrievance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/grievances/:id/comments
export async function addGrievanceComment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { message, isInternal } = req.body;

    if (!message || message.trim() === '') {
      res.status(400).json({ error: 'Comment message is required' });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen') {
      if (grievance.citizenId !== userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      if (isInternal) {
        res.status(403).json({ error: 'Citizens cannot post internal comments' });
        return;
      }
    }

    const comment = await prisma.comment.create({
      data: {
        grievanceId: id,
        userId,
        message,
        isInternal: isInternal ?? false,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/grievances/:id/comments
export async function getGrievanceComments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen' && grievance.citizenId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const whereClause: any = { grievanceId: id };
    if (role === 'Citizen') {
      whereClause.isInternal = false;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/grievances/:id/attachments
export async function uploadGrievanceAttachment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded or invalid file type' });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen' && grievance.citizenId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const attachment = await prisma.attachment.create({
      data: {
        grievanceId: id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ message: 'File uploaded successfully', attachment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/grievances/:id/attachments
export async function getGrievanceAttachments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: 'Grievance not found' });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'Citizen' && grievance.citizenId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const attachments = await prisma.attachment.findMany({
      where: { grievanceId: id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ attachments });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}