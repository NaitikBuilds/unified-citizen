import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";
import { canAccessGrievanceSubResource } from "../services/subresource-auth.service.js";
import {
  getAuditLogsByGrievanceId,
  getAuditLogsForUser,
} from "../services/audit.service.js";

// GET /api/v1/audit-logs/:grievanceId
export async function getAuditLogsByGrievance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const grievanceId = req.params.grievanceId as string;

    // Existence check before authorization so an unknown grievance is a 404,
    // not a 403 (matches GET /grievances/:id semantics).
    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
      select: { id: true },
    });

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const allowed = await canAccessGrievanceSubResource(grievanceId, {
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // An authorized grievance may have no audit records — returning an
    // empty array is a legitimate state.
    const auditLogs = await getAuditLogsByGrievanceId(grievanceId);

    res.json({ auditLogs });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/audit-logs
export async function listAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const auditLogs = await getAuditLogsForUser({
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    // Optional action filtering (exact string match on free-form action field).
    const { action } = req.query;
    let filtered = auditLogs;
    if (typeof action === "string" && action.length > 0) {
      filtered = auditLogs.filter((log) => log.action === action);
    }

    // Optional grievanceId filtering for collection endpoint.
    const { grievanceId } = req.query;
    if (typeof grievanceId === "string" && grievanceId.length > 0) {
      filtered = filtered.filter((log) => log.grievanceId === grievanceId);
    }

    // Returns a plain array, matching the escalation/SLA collection contract.
    // Frontend wraps in Paginated<T> via toPaginated() (see audit.adapter.ts).
    res.json({ auditLogs: filtered });
  } catch (error) {
    next(error);
  }
}
