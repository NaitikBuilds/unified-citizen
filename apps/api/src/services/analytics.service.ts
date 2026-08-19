import { prisma } from "./prisma.service.js";
import { GrievanceStatus, GrievancePriority, SLAStatus } from "../generated/prisma/client.js";

export interface AnalyticsUserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

export interface AnalyticsFilterOptions {
  departmentId?: string;
  from?: string;
  to?: string;
}

export interface AnalyticsSummary {
  total: number;
  submitted: number;
  aiClassified: number;
  assigned: number;
  inProgress: number;
  escalated: number;
  resolved: number;
  reopened: number;
  rejected: number;
  pending: number;
  avgResolutionHours?: number;
  slaComplianceRate?: number;
  satisfactionScore?: number;
}

export interface StatusDistributionPoint {
  status: string;
  count: number;
}

export interface PriorityDistributionPoint {
  priority: string;
  count: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  total: number;
  resolved: number;
  open: number;
  escalated: number;
  slaComplianceRate?: number;
  avgResolutionHours?: number;
}

export interface SLAComplianceBreakdown {
  totalTracked: number;
  active: number;
  warning: number;
  breached: number;
  completed: number;
  compliant: number;
  compliancePercentage: number;
}

export interface MonthlyTrendPoint {
  month: string;
  created: number;
  resolved: number;
}

export interface GeographicPoint {
  label: string;
  count: number;
  latitude?: number;
  longitude?: number;
}

const ALL_STATUSES: GrievanceStatus[] = [
  "SUBMITTED",
  "AI_CLASSIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "ESCALATED",
  "RESOLVED",
  "REJECTED",
  "REOPENED",
];

const ALL_PRIORITIES: GrievancePriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

/**
 * Resolves the department filter based on authenticated role.
 * - SUPER_ADMIN can query any department or all departments (undefined).
 * - OFFICER & DEPARTMENT_ADMIN are strictly confined to their own departmentId.
 */
function resolveDepartmentScope(
  user: AnalyticsUserContext,
  requestedDeptId?: string,
): string | null | undefined {
  if (user.role === "SUPER_ADMIN") {
    return requestedDeptId || undefined;
  }
  return user.departmentId || null;
}

function buildGrievanceWhereClause(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
) {
  const deptScope = resolveDepartmentScope(user, filters?.departmentId);

  // If a non-super-admin has no department assigned, return an impossible filter
  if (deptScope === null) {
    return { departmentId: "__NONE__" };
  }

  const where: any = {};
  if (deptScope !== undefined) {
    where.departmentId = deptScope;
  }

  if (filters?.from || filters?.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }

  return where;
}

/**
 * Computes high-level governance KPI summary from the database.
 */
export async function getAnalyticsSummary(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<AnalyticsSummary> {
  const where = buildGrievanceWhereClause(user, filters);
  const deptScope = resolveDepartmentScope(user, filters?.departmentId);

  const [statusGroups, totalGrievances, resolvedList, slaGroups, feedbackAgg] =
    await Promise.all([
      prisma.grievance.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
      prisma.grievance.count({ where }),
      prisma.grievance.findMany({
        where: { ...where, status: "RESOLVED", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.sLA.groupBy({
        by: ["status"],
        where: deptScope ? { departmentId: deptScope } : {},
        _count: { id: true },
      }),
      prisma.feedback.aggregate({
        where: deptScope ? { grievance: { departmentId: deptScope } } : {},
        _avg: { rating: true },
      }),
    ]);

  const countByStatus = new Map<string, number>();
  for (const group of statusGroups) {
    countByStatus.set(group.status, group._count.id);
  }

  const submitted = countByStatus.get("SUBMITTED") ?? 0;
  const aiClassified = countByStatus.get("AI_CLASSIFIED") ?? 0;
  const assigned = countByStatus.get("ASSIGNED") ?? 0;
  const inProgress = countByStatus.get("IN_PROGRESS") ?? 0;
  const escalated = countByStatus.get("ESCALATED") ?? 0;
  const resolved = countByStatus.get("RESOLVED") ?? 0;
  const reopened = countByStatus.get("REOPENED") ?? 0;
  const rejected = countByStatus.get("REJECTED") ?? 0;
  const pending = submitted + aiClassified;

  let avgResolutionHours: number | undefined = undefined;
  if (resolvedList.length > 0) {
    const totalHours = resolvedList.reduce((acc, g) => {
      if (!g.resolvedAt) return acc;
      const diffMs = g.resolvedAt.getTime() - g.createdAt.getTime();
      return acc + Math.max(0, diffMs / (1000 * 60 * 60));
    }, 0);
    avgResolutionHours =
      Math.round((totalHours / resolvedList.length) * 10) / 10;
  }

  let slaComplianceRate: number | undefined = undefined;
  const totalSlas = slaGroups.reduce((acc, s) => acc + s._count.id, 0);
  const breachedSlas =
    slaGroups.find((s) => s.status === "BREACHED")?._count.id ?? 0;
  if (totalSlas > 0) {
    slaComplianceRate =
      Math.round(((totalSlas - breachedSlas) / totalSlas) * 100) / 100;
  }

  const satisfactionScore = feedbackAgg._avg.rating
    ? Math.round(feedbackAgg._avg.rating * 10) / 10
    : undefined;

  return {
    total: totalGrievances,
    submitted,
    aiClassified,
    assigned,
    inProgress,
    escalated,
    resolved,
    reopened,
    rejected,
    pending,
    avgResolutionHours,
    slaComplianceRate,
    satisfactionScore,
  };
}

/**
 * Computes grievance distribution across all valid statuses.
 */
export async function getStatusDistribution(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<StatusDistributionPoint[]> {
  const where = buildGrievanceWhereClause(user, filters);

  const groups = await prisma.grievance.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const group of groups) {
    countMap.set(group.status, group._count.id);
  }

  return ALL_STATUSES.map((status) => ({
    status,
    count: countMap.get(status) ?? 0,
  }));
}

/**
 * Computes grievance distribution across all priorities.
 */
export async function getPriorityDistribution(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<PriorityDistributionPoint[]> {
  const where = buildGrievanceWhereClause(user, filters);

  const groups = await prisma.grievance.groupBy({
    by: ["priority"],
    where,
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const group of groups) {
    countMap.set(group.priority, group._count.id);
  }

  return ALL_PRIORITIES.map((priority) => ({
    priority,
    count: countMap.get(priority) ?? 0,
  }));
}

/**
 * Computes per-department breakdown of volume, resolution rate, and SLA performance.
 */
export async function getDepartmentPerformance(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<DepartmentPerformance[]> {
  const deptScope = resolveDepartmentScope(user, filters?.departmentId);

  if (deptScope === null) {
    return [];
  }

  const departments = await prisma.department.findMany({
    where: {
      isActive: true,
      ...(deptScope ? { id: deptScope } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (departments.length === 0) {
    return [];
  }

  const deptIds = departments.map((d) => d.id);

  const [grievanceGroups, resolvedList, slaGroups] = await Promise.all([
    prisma.grievance.groupBy({
      by: ["departmentId", "status"],
      where: {
        departmentId: { in: deptIds },
      },
      _count: { id: true },
    }),
    prisma.grievance.findMany({
      where: {
        departmentId: { in: deptIds },
        status: "RESOLVED",
        resolvedAt: { not: null },
      },
      select: { departmentId: true, createdAt: true, resolvedAt: true },
    }),
    prisma.sLA.groupBy({
      by: ["departmentId", "status"],
      where: {
        departmentId: { in: deptIds },
      },
      _count: { id: true },
    }),
  ]);

  const openStatuses = new Set([
    "SUBMITTED",
    "AI_CLASSIFIED",
    "ASSIGNED",
    "IN_PROGRESS",
    "REOPENED",
  ]);

  return departments.map((dept) => {
    const deptGrievances = grievanceGroups.filter(
      (g) => g.departmentId === dept.id,
    );
    const total = deptGrievances.reduce((acc, g) => acc + g._count.id, 0);
    const resolved =
      deptGrievances.find((g) => g.status === "RESOLVED")?._count.id ?? 0;
    const escalated =
      deptGrievances.find((g) => g.status === "ESCALATED")?._count.id ?? 0;
    const open = deptGrievances
      .filter((g) => openStatuses.has(g.status))
      .reduce((acc, g) => acc + g._count.id, 0);

    const deptResolved = resolvedList.filter((g) => g.departmentId === dept.id);
    let avgResolutionHours: number | undefined = undefined;
    if (deptResolved.length > 0) {
      const totalHours = deptResolved.reduce((acc, g) => {
        if (!g.resolvedAt) return acc;
        const diffMs = g.resolvedAt.getTime() - g.createdAt.getTime();
        return acc + Math.max(0, diffMs / (1000 * 60 * 60));
      }, 0);
      avgResolutionHours =
        Math.round((totalHours / deptResolved.length) * 10) / 10;
    }

    const deptSlas = slaGroups.filter((s) => s.departmentId === dept.id);
    const totalSlas = deptSlas.reduce((acc, s) => acc + s._count.id, 0);
    const breachedSlas =
      deptSlas.find((s) => s.status === "BREACHED")?._count.id ?? 0;

    let slaComplianceRate: number | undefined = undefined;
    if (totalSlas > 0) {
      slaComplianceRate =
        Math.round(((totalSlas - breachedSlas) / totalSlas) * 100) / 100;
    }

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      total,
      resolved,
      open,
      escalated,
      slaComplianceRate,
      avgResolutionHours,
    };
  });
}

/**
 * Computes detailed SLA compliance statistics.
 */
export async function getSlaComplianceBreakdown(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<SLAComplianceBreakdown> {
  const deptScope = resolveDepartmentScope(user, filters?.departmentId);

  if (deptScope === null) {
    return {
      totalTracked: 0,
      active: 0,
      warning: 0,
      breached: 0,
      completed: 0,
      compliant: 0,
      compliancePercentage: 100,
    };
  }

  const where: any = {};
  if (deptScope) {
    where.departmentId = deptScope;
  }

  const slaGroups = await prisma.sLA.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const group of slaGroups) {
    countMap.set(group.status, group._count.id);
  }

  const active = countMap.get("ACTIVE") ?? 0;
  const warning = countMap.get("WARNING") ?? 0;
  const breached = countMap.get("BREACHED") ?? 0;
  const completed = countMap.get("COMPLETED") ?? 0;
  const totalTracked = active + warning + breached + completed;
  const compliant = totalTracked - breached;
  const compliancePercentage =
    totalTracked > 0 ? Math.round((compliant / totalTracked) * 100) : 100;

  return {
    totalTracked,
    active,
    warning,
    breached,
    completed,
    compliant,
    compliancePercentage,
  };
}

/**
 * Computes monthly grievance trends for the last 6 calendar months.
 */
export async function getMonthlyTrend(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<MonthlyTrendPoint[]> {
  const where = buildGrievanceWhereClause(user, filters);

  const now = new Date();
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const grievances = await prisma.grievance.findMany({
    where: {
      ...where,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      createdAt: true,
      resolvedAt: true,
      status: true,
    },
  });

  const createdMap = new Map<string, number>();
  const resolvedMap = new Map<string, number>();

  for (const g of grievances) {
    const createdKey = `${g.createdAt.getFullYear()}-${String(
      g.createdAt.getMonth() + 1,
    ).padStart(2, "0")}`;
    createdMap.set(createdKey, (createdMap.get(createdKey) ?? 0) + 1);

    if (g.resolvedAt) {
      const resolvedKey = `${g.resolvedAt.getFullYear()}-${String(
        g.resolvedAt.getMonth() + 1,
      ).padStart(2, "0")}`;
      resolvedMap.set(resolvedKey, (resolvedMap.get(resolvedKey) ?? 0) + 1);
    }
  }

  return months.map((month) => ({
    month,
    created: createdMap.get(month) ?? 0,
    resolved: resolvedMap.get(month) ?? 0,
  }));
}

/**
 * Computes top geographic clusters based on location/address.
 */
export async function getGeographicData(
  user: AnalyticsUserContext,
  filters?: AnalyticsFilterOptions,
): Promise<GeographicPoint[]> {
  const where = buildGrievanceWhereClause(user, filters);

  const grievances = await prisma.grievance.findMany({
    where: {
      ...where,
      OR: [{ location: { not: null } }, { address: { not: null } }],
    },
    select: {
      location: true,
      address: true,
      latitude: true,
      longitude: true,
    },
    take: 500,
  });

  const geoMap = new Map<
    string,
    { count: number; latSum: number; lngSum: number; coordCount: number }
  >();

  for (const g of grievances) {
    const label = (g.location || g.address || "").trim();
    if (!label) continue;

    const existing = geoMap.get(label) ?? {
      count: 0,
      latSum: 0,
      lngSum: 0,
      coordCount: 0,
    };
    existing.count += 1;
    if (g.latitude !== null && g.longitude !== null) {
      existing.latSum += g.latitude;
      existing.lngSum += g.longitude;
      existing.coordCount += 1;
    }
    geoMap.set(label, existing);
  }

  return Array.from(geoMap.entries())
    .map(([label, data]) => ({
      label,
      count: data.count,
      latitude:
        data.coordCount > 0
          ? Math.round((data.latSum / data.coordCount) * 10000) / 10000
          : undefined,
      longitude:
        data.coordCount > 0
          ? Math.round((data.lngSum / data.coordCount) * 10000) / 10000
          : undefined,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}
