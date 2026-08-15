import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";
import { createSLAForGrievance } from "../services/sla.service.js";
import { createAuditLog } from "../services/audit.service.js";
import {
  addCommentToGrievance as addCommentService,
  addAttachmentToGrievance as addAttachmentService,
  submitGrievanceFeedback as submitFeedbackService,
} from "../services/subresource.service.js";
import { canTransitionGrievanceStatus } from "../services/grievance-status.service.js";

// POST /api/grievances
export async function createGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      description,
      category,
      departmentId,
      priority,
      latitude,
      longitude,
      address,
    } = req.body;
    const userId = req.user.userId;

    const result = await prisma.$transaction(async (tx) => {
      const grievance = await tx.grievance.create({
        data: {
          ticketId: `GRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          title,
          description,
          category,
          departmentId,
          priority: priority || "MEDIUM",
          citizenId: userId,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          address: address || null,
          status: "SUBMITTED",
        },
      });

      await createAuditLog({
        userId,
        grievanceId: grievance.id,
        action: "CREATE_GRIEVANCE",
        newValue: { title, category, departmentId, status: "SUBMITTED" },
        tx,
      });

      return grievance;
    });

    await createSLAForGrievance(result.id, departmentId, result.priority);

    res
      .status(201)
      .json({ message: "Grievance created successfully", grievance: result });
  } catch (error) {
    next(error);
  }
}

// GET /api/grievances
export async function getGrievances(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;
    const departmentId = req.user.departmentId;
    let grievances;

    if (role === "CITIZEN") {
      grievances = await prisma.grievance.findMany({
        where: { citizenId: userId },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "OFFICER" || role === "DEPARTMENT_ADMIN") {
      grievances = await prisma.grievance.findMany({
        where: { departmentId: departmentId ?? undefined },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "SUPER_ADMIN") {
      grievances = await prisma.grievance.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({ grievances });
  } catch (error) {
    next(error);
  }
}

// GET /api/grievances/:id
export async function getGrievanceById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const grievance = await prisma.grievance.findUnique({
      where: { id },
      include: {
        citizen: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;
    const departmentId = req.user.departmentId;

    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (
      (role === "OFFICER" || role === "DEPARTMENT_ADMIN") &&
      grievance.departmentId !== departmentId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({ grievance });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/grievances/:id
export async function updateGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const {
      title,
      description,
      category,
      departmentId,
      latitude,
      longitude,
      address,
    } = req.body;
    const userId = req.user.userId;

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (
      (role === "OFFICER" || role === "DEPARTMENT_ADMIN") &&
      grievance.departmentId !== req.user.departmentId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const updatedGrievance = await prisma.$transaction(async (tx) => {
      const updated = await tx.grievance.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(category && { category }),
          ...(role === "SUPER_ADMIN" && departmentId && { departmentId }),
          ...(latitude !== undefined && {
            latitude: latitude ? parseFloat(latitude) : null,
          }),
          ...(longitude !== undefined && {
            longitude: longitude ? parseFloat(longitude) : null,
          }),
          ...(address !== undefined && { address }),
        },
      });

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "UPDATE_GRIEVANCE",
        oldValue: grievance,
        newValue: updated,
        tx,
      });

      return updated;
    });

    res.json({
      message: "Grievance updated successfully",
      grievance: updatedGrievance,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/grievances/:id/status
export async function updateGrievanceStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { status, comment } = req.body;
    const userId = req.user.userId;

    if (!status) {
      res.status(400).json({ error: "Missing required field: status" });
      return;
    }

    const role = req.user.role;
    const departmentId = req.user.departmentId;

    if (role === "CITIZEN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    if (
      (role === "OFFICER" || role === "DEPARTMENT_ADMIN") &&
      grievance.departmentId !== departmentId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (!canTransitionGrievanceStatus(grievance.status, status)) {
      res.status(400).json({
        error: `Invalid grievance status transition: ${grievance.status} -> ${status}`,
      });
      return;
    }

    const updatedGrievance = await prisma.$transaction(async (tx) => {
      const updated = await tx.grievance.update({
        where: { id },
        data: { status },
      });

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "UPDATE_STATUS",
        oldValue: { status: grievance.status },
        newValue: { status },
        metadata: { comment: comment || "Status updated manually" },
        tx,
      });

      return updated;
    });

    res.json({
      message: "Grievance status updated successfully",
      grievance: updatedGrievance,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const userId = req.user.userId;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    if (role === "CITIZEN") {
      if (grievance.citizenId !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (grievance.status !== "SUBMITTED") {
        res.status(400).json({
          error: "Cannot delete grievance after it has been processed",
        });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.grievance.delete({ where: { id } });
      await createAuditLog({
        userId,
        grievanceId: id,
        action: "DELETE_GRIEVANCE",
        oldValue: grievance,
        tx,
      });
    });

    res.json({ message: "Grievance deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function assignGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { officerId } = req.body;
    const userId = req.user.userId;

    if (!officerId) {
      res.status(400).json({ error: "Missing required field: officerId" });
      return;
    }

    const role = req.user.role;
    const userDepartmentId = req.user.departmentId;

    if (role !== "DEPARTMENT_ADMIN" && role !== "SUPER_ADMIN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const grievance = await prisma.grievance.findUnique({ where: { id } });
    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    if (
      role === "DEPARTMENT_ADMIN" &&
      grievance.departmentId !== userDepartmentId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const officer = await prisma.user.findUnique({ where: { id: officerId } });
    if (!officer) {
      res.status(404).json({ error: "Officer not found" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedGrievance = await tx.grievance.update({
        where: { id },
        data: {
          status:
            grievance.status === "SUBMITTED" ? "IN_PROGRESS" : grievance.status,
        },
      });

      await tx.assignment.create({
        data: {
          grievanceId: id,
          officerId,
          departmentId: grievance.departmentId || officer.departmentId || "",
          assignedById: userId,
          type: "MANUAL",
          status: "ACTIVE",
        },
      });

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "ASSIGN_GRIEVANCE",
        newValue: { officerId },
        tx,
      });

      return updatedGrievance;
    });

    res.json({ message: "Grievance assigned successfully", grievance: result });
  } catch (error) {
    next(error);
  }
}

// POST /api/grievances/:id/comments
export async function addGrievanceComment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      res.status(400).json({ error: "Comment message is required" });
      return;
    }

    const comment = await addCommentService(
      id,
      {
        userId: req.user.userId,
        role: req.user.role,
        departmentId: req.user.departmentId ?? null,
      },
      message,
    );

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
}

// GET /api/grievances/:id/comments
export async function getGrievanceComments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const whereClause: { grievanceId: string; isInternal?: boolean } = {
      grievanceId: id,
    };
    if (role === "CITIZEN") {
      whereClause.isInternal = false;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
}

// POST /api/grievances/:id/attachments
export async function uploadGrievanceAttachment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded or invalid file type" });
      return;
    }

    const attachment = await addAttachmentService(
      id,
      {
        userId: req.user.userId,
        role: req.user.role,
        departmentId: req.user.departmentId ?? null,
      },
      `/uploads/${file.filename}`,
      file.mimetype,
      file.originalname,
    );

    res.status(201).json({ message: "File uploaded successfully", attachment });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
}

// GET /api/grievances/:id/attachments
export async function getGrievanceAttachments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    const userId = req.user.userId;

    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const attachments = await prisma.attachment.findMany({
      where: { grievanceId: id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ attachments });
  } catch (error) {
    next(error);
  }
}

// POST /api/grievances/:id/escalate
export async function escalateGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const userId = req.user.userId;
    const grievance = await prisma.grievance.findUnique({
      where: { id },
      include: { sla: true },
    });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const updatedGrievance = await prisma.$transaction(async (tx) => {
      const updated = await tx.grievance.update({
        where: { id },
        data: {
          priority: "CRITICAL",
          status: "ESCALATED",
        },
      });

      if (grievance.sla) {
        await tx.sLA.update({
          where: { id: grievance.sla.id },
          data: { status: "BREACHED" },
        });
      }

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "ESCALATE_GRIEVANCE",
        oldValue: { status: grievance.status, priority: grievance.priority },
        newValue: { status: "ESCALATED", priority: "CRITICAL" },
        tx,
      });

      return updated;
    });

    res.json({
      message: "Grievance escalated successfully",
      grievance: updatedGrievance,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/grievances/:id/feedback
export async function addGrievanceFeedback(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { rating, feedback } = req.body;

    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    if (grievance.citizenId !== req.user.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (grievance.status !== "RESOLVED") {
      res
        .status(400)
        .json({ error: "Can only provide feedback on resolved grievances" });
      return;
    }

    const newFeedback = await submitFeedbackService(
      id,
      {
        userId: req.user.userId,
        role: req.user.role,
        departmentId: req.user.departmentId ?? null,
      },
      Number(rating) || 5,
      feedback,
    );

    res.json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
}

// POST /api/grievances/:id/reopen
export async function reopenGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { reason } = req.body;
    const userId = req.user.userId;

    const grievance = await prisma.grievance.findUnique({ where: { id } });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    if (grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (grievance.status !== "RESOLVED") {
      res
        .status(400)
        .json({ error: "Only resolved grievances can be reopened" });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedGrievance = await tx.grievance.update({
        where: { id },
        data: {
          status: "REOPENED",
        },
      });

      if (reason) {
        await tx.comment.create({
          data: {
            message: `Grievance reopened by citizen. Reason: ${reason}`,
            grievanceId: id,
            userId: userId,
          } as any,
        });
      }

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "REOPEN_GRIEVANCE",
        oldValue: { status: "RESOLVED" },
        newValue: { status: "REOPENED", reason },
        tx,
      });

      return updatedGrievance;
    });

    res.json({
      message: "Grievance reopened successfully",
      grievance: updated,
    });
  } catch (error) {
    next(error);
  }
}
