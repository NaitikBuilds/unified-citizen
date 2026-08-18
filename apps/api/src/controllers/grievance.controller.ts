import { analyzeGrievance } from "../ai/services/analysis.service.js";

import path from "path";
import fs from "fs";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";
import { createSLAForGrievance } from "../services/sla.service.js";
import { createEscalation } from "../services/escalation.service.js";
import { createAuditLog } from "../services/audit.service.js";
import { createNotification } from "../services/notification.service.js";
import { validateFileSignature } from "../middlewares/upload.middleware.js";
import {
  addCommentToGrievance as addCommentService,
  addAttachmentToGrievance as addAttachmentService,
  submitGrievanceFeedback as submitFeedbackService,
} from "../services/subresource.service.js";
import { canTransitionGrievanceStatus } from "../services/grievance-status.service.js";
import { canAccessGrievanceSubResource } from "../services/subresource-auth.service.js";

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

    /*
     * Basic validation.
     *
     * The grievance API requires title, description and category
     * according to the existing request validation.
     */
    if (!title || typeof title !== "string") {
      res.status(400).json({
        error: "Title is required",
      });
      return;
    }

    if (!description || typeof description !== "string") {
      res.status(400).json({
        error: "Description is required",
      });
      return;
    }

    if (!category || typeof category !== "string") {
      res.status(400).json({
        error: "Category is required",
      });
      return;
    }

    /*
     * ---------------------------------------------------------
     * STEP 1: AI CLASSIFICATION
     * ---------------------------------------------------------
     *
     * Gemini determines:
     * - category
     * - department
     * - priority
     * - sentiment
     * - confidence
     * - summary
     * - explanation
     */
    const aiAnalysis = await analyzeGrievance(
      title,
      description,
      category ?? null,
      null,
      userId,
    );

    const {
      classification: aiClassification,
      duplicateDetection,
      spamDetection,
    } = aiAnalysis;

    if (spamDetection.isSpam) {
      res.status(400).json({
        error: "Grievance rejected as spam",
        spamDetection,
      });
      return;
    }

    /*
     * ---------------------------------------------------------
     * STEP 3: DATABASE TRANSACTION
     * ---------------------------------------------------------
     */
    const result = await prisma.$transaction(async (tx) => {
      /*
       * AI department is represented by Department.code
       * in the existing Prisma schema.
       */
      const aiDepartment = await tx.department.findUnique({
        where: {
          code: aiClassification.department,
        },
      });

      if (!aiDepartment || !aiDepartment.isActive) {
        throw new Error(
          `AI returned invalid or inactive department: ${aiClassification.department}`,
        );
      }

      /*
       * Create the main grievance.
       *
       * Only fields that actually exist in the Prisma
       * Grievance model are used here.
       */
      const grievance = await tx.grievance.create({
        data: {
          ticketId: `GRV-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000,
          )}`,

          title,
          description,

          /*
           * AI classification is the source for the
           * stored category and priority.
           */
          category: aiClassification.category,
          priority: aiClassification.priority,

          /*
           * AI recommended department.
           */
          departmentId: aiDepartment.id,

          citizenId: userId,

          latitude:
            latitude !== undefined && latitude !== null && latitude !== ""
              ? Number(latitude)
              : null,

          longitude:
            longitude !== undefined && longitude !== null && longitude !== ""
              ? Number(longitude)
              : null,

          address: address !== undefined && address !== "" ? address : null,

          status: "SUBMITTED",

          /*
           * AIClassification is a one-to-one relation:
           *
           * Grievance -> AIClassification
           *
           * The Prisma schema contains:
           * duplicateScore Float?
           *
           * Therefore the duplicate score is stored here.
           */
          aiClassification: {
            create: {
              category: aiClassification.category,
              department: aiClassification.department,
              priority: aiClassification.priority,

              sentiment: aiClassification.sentiment,
              severity: aiClassification.severity,
              confidence: aiClassification.confidence,

              summary: aiClassification.summary,
              explanation: aiClassification.explanation,

              duplicateScore: duplicateDetection.duplicateScore,

              modelName: "gemini-3.5-flash",
              modelVersion: "3.5",
            },
          },
        },

        /*
         * Return the AI classification as part of the created
         * grievance response.
         */
        include: {
          aiClassification: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      /*
       * -------------------------------------------------------
       * STEP 4: AUDIT LOG
       * -------------------------------------------------------
       *
       * AuditLog is already part of the Prisma schema.
       */
      await createAuditLog({
        userId,
        grievanceId: grievance.id,
        action: "CREATE_GRIEVANCE",

        newValue: {
          title: grievance.title,
          category: grievance.category,
          departmentId: grievance.departmentId,
          priority: grievance.priority,
          status: grievance.status,
          duplicateScore: duplicateDetection.duplicateScore,
          duplicateRelationship: duplicateDetection.relationship,
        },

        tx,
      });

      /*
       * -------------------------------------------------------
       * STEP 5: SLA
       * -------------------------------------------------------
       *
       * SLA and SLAPolicy already exist in Prisma.
       *
       * The SLA is created using the actual department and
       * AI-selected priority.
       */
      await createSLAForGrievance(
        grievance.id,
        grievance.departmentId,
        grievance.priority,
        tx,
      );

      return grievance;
    });

    /*
     * ---------------------------------------------------------
     * STEP 6: RESPONSE
     * ---------------------------------------------------------
     *
     * Return both the created grievance and the duplicate
     * detection result.
     */
    res.status(201).json({
      message: "Grievance created successfully",

      grievance: result,

      duplicateDetection: {
        relationship: duplicateDetection.relationship,
        duplicateScore: duplicateDetection.duplicateScore,
        explanation: duplicateDetection.explanation,
      },
    });
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

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    let where: any = {};

    if (role === "CITIZEN") {
      where = { citizenId: userId };
    } else if (role === "OFFICER" || role === "DEPARTMENT_ADMIN") {
      // A staff user without a department must never be able to list
      // grievances outside any scope (departmentId: undefined would match
      // every grievance).
      if (!departmentId) {
        res.status(403).json({
          error: "Forbidden: You are not assigned to a department",
        });
        return;
      }
      // Officers see only grievances actively assigned to them; department
      // admins see the full department scope (per governance requirements).
      where =
        role === "OFFICER"
          ? {
              departmentId,
              assignments: {
                some: { officerId: userId, status: "ACTIVE" },
              },
            }
          : { departmentId };
    } else if (role === "SUPER_ADMIN") {
      where = {};
    } else {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [grievances, total] = await Promise.all([
      prisma.grievance.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.grievance.count({ where }),
    ]);

    res.json({
      grievances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
      role === "DEPARTMENT_ADMIN" &&
      (!departmentId || grievance.departmentId !== departmentId)
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Officers may only access grievances actively assigned to them.
    if (role === "OFFICER") {
      if (!departmentId || grievance.departmentId !== departmentId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const assignment = await prisma.assignment.findFirst({
        where: { grievanceId: id, officerId: userId, status: "ACTIVE" },
        select: { id: true },
      });
      if (!assignment) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
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

    // A citizen may only edit a grievance before the department starts
    // processing it; afterwards the record is the official investigation basis.
    if (role === "CITIZEN" && grievance.status !== "SUBMITTED") {
      res.status(400).json({
        error: "Cannot update a grievance after it has been processed",
      });
      return;
    }

    if (
      (role === "OFFICER" || role === "DEPARTMENT_ADMIN") &&
      grievance.departmentId !== req.user.departmentId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Officers may only update grievances actively assigned to them.
    if (role === "OFFICER") {
      const assignment = await prisma.assignment.findFirst({
        where: { grievanceId: id, officerId: userId, status: "ACTIVE" },
        select: { id: true },
      });
      if (!assignment) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
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

    if (role === "OFFICER") {
      const assignment = await prisma.assignment.findFirst({
        where: {
          grievanceId: id,
          officerId: userId,
          status: "ACTIVE",
        },
      });

      if (!assignment) {
        res.status(403).json({
          error: "Forbidden: You are not assigned to this grievance",
        });
        return;
      }
    }
    // Role-specific transition authorization.
    // Officers may only move their assigned grievances forward
    // to IN_PROGRESS or RESOLVED.
    if (
      role === "OFFICER" &&
      status !== "IN_PROGRESS" &&
      status !== "RESOLVED"
    ) {
      res.status(403).json({
        error: "Forbidden: Officers cannot perform this status transition",
      });
      return;
    }

    // Department admins may manage department-level workflow,
    // but ASSIGNED should be handled through the dedicated
    // assignment endpoint.
    if (
      role === "DEPARTMENT_ADMIN" &&
      (status === "ASSIGNED" ||
        status === "AI_CLASSIFIED" ||
        status === "REOPENED")
    ) {
      res.status(403).json({
        error:
          "Forbidden: Department admins cannot perform this status transition",
      });
      return;
    }

    // SUPER_ADMIN is unrestricted by role-specific transition rules.
    if (!canTransitionGrievanceStatus(grievance.status, status)) {
      res.status(400).json({
        error: `Invalid grievance status transition: ${grievance.status} -> ${status}`,
      });
      return;
    }

    const updatedGrievance = await prisma.$transaction(async (tx) => {
      const updated = await tx.grievance.update({
        where: { id },
        data: {
          status,
          // Record when the grievance reached RESOLVED for lifecycle reporting.
          ...(status === "RESOLVED" && { resolvedAt: new Date() }),
        },
      });

      // RESOLVED or REJECTED terminates the SLA lifecycle:
      // - RESOLVED completes the SLA (work finished, deadlines met)
      // - REJECTED completes the SLA so a terminal grievance can never
      //   falsely accrue a WARNING/BREACHED state and notify the citizen.
      if (status === "RESOLVED" || status === "REJECTED") {
        await tx.sLA.updateMany({
          where: {
            grievanceId: id,
            status: { in: ["ACTIVE", "WARNING", "BREACHED"] },
          },
          data: {
            status: "COMPLETED",
            ...(status === "RESOLVED" && {
              resolutionCompletedAt: new Date(),
            }),
          },
        });
      }

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

    await createNotification({
      userId: grievance.citizenId,
      title: "Grievance status updated",
      message: `Your grievance status has changed to ${status}.`,
      type: "STATUS_CHANGED",
      grievanceId: id,
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
      // Insert the audit entry BEFORE deleting the grievance; an insert after
      // the delete would violate the foreign key and be silently dropped.
      await createAuditLog({
        userId,
        grievanceId: id,
        action: "DELETE_GRIEVANCE",
        oldValue: grievance,
        tx,
      });
      await tx.grievance.delete({ where: { id } });
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

    const grievance = await prisma.grievance.findUnique({
      where: { id },
    });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    if (!grievance.departmentId) {
      res.status(400).json({
        error: "Cannot assign a grievance without a department",
      });
      return;
    }
    const grievanceDepartmentId = grievance.departmentId;

    // Department admins may only assign grievances belonging
    // to their own department.
    if (
      role === "DEPARTMENT_ADMIN" &&
      grievanceDepartmentId !== userDepartmentId
    ) {
      res.status(403).json({
        error: "Forbidden: Grievance belongs to another department",
      });
      return;
    }

    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      select: {
        id: true,
        name: true,
        role: true,
        departmentId: true,
      },
    });

    if (!officer) {
      res.status(404).json({ error: "Officer not found" });
      return;
    }

    if (officer.role !== "OFFICER") {
      res.status(400).json({
        error: "Selected user is not an officer",
      });
      return;
    }

    if (!officer.departmentId) {
      res.status(400).json({
        error: "Selected officer is not assigned to a department",
      });
      return;
    }

    // The officer must belong to the grievance's department.
    if (officer.departmentId !== grievanceDepartmentId) {
      res.status(403).json({
        error: "Officer does not belong to the grievance department",
      });
      return;
    }

    // Department admins cannot use the request body to cross
    // department boundaries.
    if (
      role === "DEPARTMENT_ADMIN" &&
      officer.departmentId !== userDepartmentId
    ) {
      res.status(403).json({
        error: "Forbidden: Officer belongs to another department",
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Reassignment: revoke any previous ACTIVE assignment for this
      // grievance so the former officer no longer holds active authority.
      await tx.assignment.updateMany({
        where: { grievanceId: id, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });

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
          departmentId: grievanceDepartmentId,
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

    await createNotification({
      userId: grievance.citizenId,
      title: "Grievance assigned",
      message: "Your grievance has been assigned to an officer.",
      type: "ASSIGNMENT_CHANGED",
      grievanceId: id,
    });

    await createNotification({
      userId: officerId,
      title: "New grievance assigned",
      message: `You have been assigned grievance ${grievance.ticketId}.`,
      type: "ASSIGNMENT_CHANGED",
      grievanceId: id,
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
    const { message, isInternal } = req.body;

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
      isInternal === true,
    );

    // Notify the citizen when staff comment publicly on their grievance
    // (internal comments are staff-only and do not trigger notifications).
    if (isInternal !== true && req.user.role !== "CITIZEN") {
      const grievanceOwner = await prisma.grievance.findUnique({
        where: { id },
        select: { citizenId: true },
      });
      if (grievanceOwner && grievanceOwner.citizenId !== req.user.userId) {
        await createNotification({
          userId: grievanceOwner.citizenId,
          title: "New comment on your grievance",
          message: "A staff member added a comment to your grievance.",
          type: "COMMENT_ADDED",
          grievanceId: id,
        });
      }
    }

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

    const allowed = await canAccessGrievanceSubResource(id, {
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const whereClause: { grievanceId: string; isInternal?: boolean } = {
      grievanceId: id,
    };
    if (req.user.role === "CITIZEN") {
      whereClause.isInternal = false;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: whereClause }),
    ]);

    res.json({
      comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
  // The multer-written file is removed on EVERY non-success path so failed or
  // unauthorized uploads can never accumulate orphaned files on disk. It is
  // kept only when the attachment record is successfully created.
  let uploadedFilePath: string | null = null;
  let keepFile = false;

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

    uploadedFilePath = path.join(process.cwd(), "uploads", file.filename);

    // Verify the actual file content matches the declared MIME type (the
    // client-supplied MIME header is trivially spoofable).
    const signatureValid = await validateFileSignature(
      uploadedFilePath,
      file.mimetype,
    );
    if (!signatureValid) {
      res.status(400).json({
        error: "File content does not match the declared file type",
      });
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

    keepFile = true;
    res.status(201).json({ message: "File uploaded successfully", attachment });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  } finally {
    // Keep the file only on success; delete it in every other case.
    if (uploadedFilePath && !keepFile) {
      await fs.promises.unlink(uploadedFilePath).catch(() => {});
    }
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

    const allowed = await canAccessGrievanceSubResource(id, {
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    if (!allowed) {
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

// GET /api/grievances/:id/attachments/:attachmentId
export async function downloadGrievanceAttachment(
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
    const attachmentId = req.params.attachmentId as string;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.grievanceId !== id) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    const allowed = await canAccessGrievanceSubResource(id, {
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // fileUrl is server-generated as `/uploads/<random-filename>`; resolve it
    // with path.basename so traversal attempts can never escape the uploads
    // directory.
    const uploadsDir = path.join(process.cwd(), "uploads");
    const fileName = path.basename(attachment.fileUrl);
    const filePath = path.join(uploadsDir, fileName);

    if (!filePath.startsWith(uploadsDir)) {
      res.status(400).json({ error: "Invalid attachment path" });
      return;
    }

    try {
      await fs.promises.access(filePath);
    } catch {
      res.status(404).json({ error: "Attachment file not found" });
      return;
    }

    const safeName = (attachment.fileName || fileName).replace(
      /["\\\r\n]/g,
      "_",
    );
    res.download(filePath, safeName);
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
    const { level, reason } = req.body;
    const userId = req.user.userId;

    if (!level || !reason) {
      res
        .status(400)
        .json({ error: "Escalation level and reason are required" });
      return;
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id },
    });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const role = req.user.role;
    const departmentId = req.user.departmentId;

    // Ownership/department boundary:
    // - CITIZEN: only their own grievance
    // - OFFICER / DEPARTMENT_ADMIN: only grievances in their department
    // - SUPER_ADMIN: system-wide
    if (role === "CITIZEN" && grievance.citizenId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (
      (role === "OFFICER" || role === "DEPARTMENT_ADMIN") &&
      (!departmentId || grievance.departmentId !== departmentId)
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Officers may only escalate grievances actively assigned to them.
    if (role === "OFFICER") {
      const assignment = await prisma.assignment.findFirst({
        where: { grievanceId: id, officerId: userId, status: "ACTIVE" },
        select: { id: true },
      });
      if (!assignment) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    // Escalation eligibility: only grievances in a state that permits
    // transitioning to ESCALATED may be escalated.
    if (!canTransitionGrievanceStatus(grievance.status, "ESCALATED")) {
      res.status(400).json({
        error: `Grievance cannot be escalated from status ${grievance.status}`,
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Prevent duplicate open escalations for the same grievance.
      const existing = await tx.escalation.findFirst({
        where: { grievanceId: id, status: "OPEN" },
      });

      if (existing) {
        throw new Error("Grievance is already escalated");
      }

      const escalation = await createEscalation(id, userId, level, reason, tx);

      const updated = await tx.grievance.update({
        where: { id },
        data: { status: "ESCALATED" },
      });

      await createAuditLog({
        userId,
        grievanceId: id,
        action: "ESCALATE_GRIEVANCE",
        oldValue: { status: grievance.status, priority: grievance.priority },
        newValue: { status: "ESCALATED", level },
        metadata: { reason },
        tx,
      });

      return { escalation, updated };
    });

    await createNotification({
      userId: grievance.citizenId,
      title: "Grievance escalated",
      message: "Your grievance has been escalated for urgent handling.",
      type: "ESCALATION_CREATED",
      grievanceId: id,
    });

    res.json({
      message: "Grievance escalated successfully",
      escalation: result.escalation,
      grievance: result.updated,
    });
  } catch (error: any) {
    if (error?.message === "Grievance is already escalated") {
      res.status(409).json({ error: error.message });
      return;
    }
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
    const { rating, comment } = req.body;

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

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        grievanceId: id,
        userId: req.user.userId,
      },
    });

    if (existingFeedback) {
      res.status(409).json({
        error: "Feedback has already been submitted for this grievance",
      });
      return;
    }

    const numericRating = Number(rating);
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      res.status(400).json({
        error: "Rating must be an integer between 1 and 5",
      });
      return;
    }
    const newFeedback = await submitFeedbackService(
      id,
      {
        userId: req.user.userId,
        role: req.user.role,
        departmentId: req.user.departmentId ?? null,
      },
      numericRating,
      comment,
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

// GET /api/grievances/:id/feedback
export async function getGrievanceFeedback(
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

    const allowed = await canAccessGrievanceSubResource(id, {
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Citizens see only their own feedback; staff see all feedback for the
    // grievance (ratings are part of the governance record).
    const where =
      req.user.role === "CITIZEN"
        ? { grievanceId: id, userId: req.user.userId }
        : { grievanceId: id };

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ feedback });
  } catch (error) {
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
          },
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

    // Notify the officer holding the active assignment (if any) so the
    // reopened grievance re-enters the workflow.
    const activeAssignment = await prisma.assignment.findFirst({
      where: { grievanceId: id, status: "ACTIVE" },
      select: { officerId: true },
    });
    if (activeAssignment) {
      await createNotification({
        userId: activeAssignment.officerId,
        title: "Grievance reopened",
        message: `Grievance ${grievance.ticketId} was reopened by the citizen.`,
        type: "STATUS_CHANGED",
        grievanceId: id,
      });
    }

    res.json({
      message: "Grievance reopened successfully",
      grievance: updated,
    });
  } catch (error) {
    next(error);
  }
}
