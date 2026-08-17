import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../services/prisma.service.js";
import { canAccessGrievanceSubResource } from "../services/subresource-auth.service.js";
import {
  getSlaByGrievanceId,
  getSlasForUser,
} from "../services/sla.service.js";

// GET /api/v1/slas/:grievanceId
export async function getSlaByGrievance(
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

    // SLA creation is asynchronous to grievance creation, so `null` is a
    // legitimate state — mirroring how empty sub-resources return their
    // field (e.g. `{ comments: [] }`).
    const sla = await getSlaByGrievanceId(grievanceId);

    res.json({ sla });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/slas
export async function listSlas(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const slas = await getSlasForUser({
      userId: req.user.userId,
      role: req.user.role,
      departmentId: req.user.departmentId ?? null,
    });

    res.json({ slas });
  } catch (error) {
    next(error);
  }
}
