import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  getAnalyticsSummary,
  getStatusDistribution,
  getPriorityDistribution,
  getDepartmentPerformance,
  getSlaComplianceBreakdown,
  getMonthlyTrend,
  getGeographicData,
} from "../services/analytics.service.js";

function extractFilters(req: AuthenticatedRequest) {
  return {
    departmentId: req.query.departmentId as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  };
}

export async function getSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const summary = await getAnalyticsSummary(req.user, filters);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
}

export async function getStatuses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const statusDistribution = await getStatusDistribution(req.user, filters);
    res.json({ statusDistribution });
  } catch (error) {
    next(error);
  }
}

export async function getPriorities(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const priorityDistribution = await getPriorityDistribution(
      req.user,
      filters,
    );
    res.json({ priorityDistribution });
  } catch (error) {
    next(error);
  }
}

export async function getDepartments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const departmentPerformance = await getDepartmentPerformance(
      req.user,
      filters,
    );
    res.json({ departmentPerformance });
  } catch (error) {
    next(error);
  }
}

export async function getSlaCompliance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const slaCompliance = await getSlaComplianceBreakdown(req.user, filters);
    res.json({ slaCompliance });
  } catch (error) {
    next(error);
  }
}

export async function getTrend(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const monthlyTrend = await getMonthlyTrend(req.user, filters);
    res.json({ monthlyTrend });
  } catch (error) {
    next(error);
  }
}

export async function getGeographic(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filters = extractFilters(req);
    const geographicData = await getGeographicData(req.user, filters);
    res.json({ geographicData });
  } catch (error) {
    next(error);
  }
}
