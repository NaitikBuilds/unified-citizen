import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma.service.js", () => ({
  prisma: {
    grievance: {
      groupBy: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    sLA: {
      groupBy: vi.fn(),
    },
    feedback: {
      aggregate: vi.fn(),
    },
    department: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "./prisma.service.js";
import {
  getAnalyticsSummary,
  getStatusDistribution,
  getPriorityDistribution,
  getDepartmentPerformance,
  getSlaComplianceBreakdown,
  getMonthlyTrend,
  getGeographicData,
  type AnalyticsUserContext,
} from "./analytics.service.js";

const superAdmin: AnalyticsUserContext = {
  userId: "admin-1",
  role: "SUPER_ADMIN",
  departmentId: null,
};

const deptAdmin: AnalyticsUserContext = {
  userId: "dept-admin-1",
  role: "DEPARTMENT_ADMIN",
  departmentId: "dept-water",
};

const staffNoDept: AnalyticsUserContext = {
  userId: "staff-orphan",
  role: "DEPARTMENT_ADMIN",
  departmentId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Analytics Service", () => {
  describe("getAnalyticsSummary", () => {
    it("computes summary correctly for SUPER_ADMIN global scope", async () => {
      (prisma.grievance.groupBy as any).mockResolvedValue([
        { status: "SUBMITTED", _count: { id: 10 } },
        { status: "AI_CLASSIFIED", _count: { id: 5 } },
        { status: "IN_PROGRESS", _count: { id: 8 } },
        { status: "RESOLVED", _count: { id: 20 } },
        { status: "ESCALATED", _count: { id: 2 } },
      ]);
      (prisma.grievance.count as any).mockResolvedValue(45);

      const now = Date.now();
      const tenHoursAgo = new Date(now - 10 * 3600 * 1000);
      const fiveHoursAgo = new Date(now - 5 * 3600 * 1000);

      (prisma.grievance.findMany as any).mockResolvedValue([
        { createdAt: tenHoursAgo, resolvedAt: fiveHoursAgo }, // 5 hours
        { createdAt: tenHoursAgo, resolvedAt: new Date(now) }, // 10 hours
      ]);

      (prisma.sLA.groupBy as any).mockResolvedValue([
        { status: "COMPLETED", _count: { id: 18 } },
        { status: "BREACHED", _count: { id: 2 } },
      ]);

      (prisma.feedback.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      const summary = await getAnalyticsSummary(superAdmin);

      expect(summary.total).toBe(45);
      expect(summary.submitted).toBe(10);
      expect(summary.aiClassified).toBe(5);
      expect(summary.pending).toBe(15);
      expect(summary.resolved).toBe(20);
      expect(summary.escalated).toBe(2);
      expect(summary.avgResolutionHours).toBe(7.5);
      expect(summary.slaComplianceRate).toBe(0.9); // (20 - 2) / 20 = 0.90
      expect(summary.satisfactionScore).toBe(4.5);
    });

    it("scopes summary to authenticated department for DEPARTMENT_ADMIN", async () => {
      (prisma.grievance.groupBy as any).mockResolvedValue([]);
      (prisma.grievance.count as any).mockResolvedValue(0);
      (prisma.grievance.findMany as any).mockResolvedValue([]);
      (prisma.sLA.groupBy as any).mockResolvedValue([]);
      (prisma.feedback.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      await getAnalyticsSummary(deptAdmin);

      expect(prisma.grievance.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: "dept-water" }),
        }),
      );
      expect(prisma.sLA.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: "dept-water" }),
        }),
      );
    });

    it("handles empty datasets safely without NaN or division by zero", async () => {
      (prisma.grievance.groupBy as any).mockResolvedValue([]);
      (prisma.grievance.count as any).mockResolvedValue(0);
      (prisma.grievance.findMany as any).mockResolvedValue([]);
      (prisma.sLA.groupBy as any).mockResolvedValue([]);
      (prisma.feedback.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const summary = await getAnalyticsSummary(superAdmin);

      expect(summary.total).toBe(0);
      expect(summary.pending).toBe(0);
      expect(summary.resolved).toBe(0);
      expect(summary.avgResolutionHours).toBeUndefined();
      expect(summary.slaComplianceRate).toBeUndefined();
      expect(summary.satisfactionScore).toBeUndefined();
    });
  });

  describe("getStatusDistribution", () => {
    it("returns counts for all statuses including zeros", async () => {
      (prisma.grievance.groupBy as any).mockResolvedValue([
        { status: "SUBMITTED", _count: { id: 4 } },
        { status: "RESOLVED", _count: { id: 12 } },
      ]);

      const dist = await getStatusDistribution(superAdmin);

      expect(dist).toEqual(
        expect.arrayContaining([
          { status: "SUBMITTED", count: 4 },
          { status: "RESOLVED", count: 12 },
          { status: "ASSIGNED", count: 0 },
          { status: "IN_PROGRESS", count: 0 },
          { status: "ESCALATED", count: 0 },
        ]),
      );
    });
  });

  describe("getPriorityDistribution", () => {
    it("returns counts for all priorities", async () => {
      (prisma.grievance.groupBy as any).mockResolvedValue([
        { priority: "HIGH", _count: { id: 7 } },
        { priority: "CRITICAL", _count: { id: 3 } },
      ]);

      const dist = await getPriorityDistribution(superAdmin);

      expect(dist).toEqual(
        expect.arrayContaining([
          { priority: "HIGH", count: 7 },
          { priority: "CRITICAL", count: 3 },
          { priority: "MEDIUM", count: 0 },
          { priority: "LOW", count: 0 },
        ]),
      );
    });
  });

  describe("getDepartmentPerformance", () => {
    it("returns performance metrics per active department", async () => {
      (prisma.department.findMany as any).mockResolvedValue([
        { id: "dept-1", name: "Roads" },
        { id: "dept-2", name: "Water" },
      ]);

      (prisma.grievance.groupBy as any).mockResolvedValue([
        { departmentId: "dept-1", status: "RESOLVED", _count: { id: 8 } },
        { departmentId: "dept-1", status: "IN_PROGRESS", _count: { id: 2 } },
        { departmentId: "dept-2", status: "SUBMITTED", _count: { id: 5 } },
      ]);

      const now = Date.now();
      (prisma.grievance.findMany as any).mockResolvedValue([
        {
          departmentId: "dept-1",
          createdAt: new Date(now - 4 * 3600 * 1000),
          resolvedAt: new Date(now),
        },
      ]);

      (prisma.sLA.groupBy as any).mockResolvedValue([
        { departmentId: "dept-1", status: "COMPLETED", _count: { id: 8 } },
        { departmentId: "dept-1", status: "BREACHED", _count: { id: 2 } },
      ]);

      const perf = await getDepartmentPerformance(superAdmin);

      expect(perf).toHaveLength(2);
      const roads = perf.find((p) => p.departmentId === "dept-1");
      expect(roads).toBeDefined();
      expect(roads?.total).toBe(10);
      expect(roads?.resolved).toBe(8);
      expect(roads?.open).toBe(2);
      expect(roads?.avgResolutionHours).toBe(4);
      expect(roads?.slaComplianceRate).toBe(0.8);
    });

    it("restricts DEPARTMENT_ADMIN to only their department", async () => {
      (prisma.department.findMany as any).mockResolvedValue([
        { id: "dept-water", name: "Water" },
      ]);
      (prisma.grievance.groupBy as any).mockResolvedValue([]);
      (prisma.grievance.findMany as any).mockResolvedValue([]);
      (prisma.sLA.groupBy as any).mockResolvedValue([]);

      const perf = await getDepartmentPerformance(deptAdmin);

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: "dept-water" }),
        }),
      );
      expect(perf).toHaveLength(1);
      expect(perf[0].departmentId).toBe("dept-water");
    });

    it("returns empty array for staff with no department", async () => {
      const perf = await getDepartmentPerformance(staffNoDept);
      expect(perf).toEqual([]);
    });
  });

  describe("getSlaComplianceBreakdown", () => {
    it("computes compliant counts and compliance percentage", async () => {
      (prisma.sLA.groupBy as any).mockResolvedValue([
        { status: "ACTIVE", _count: { id: 10 } },
        { status: "WARNING", _count: { id: 5 } },
        { status: "BREACHED", _count: { id: 5 } },
        { status: "COMPLETED", _count: { id: 30 } },
      ]);

      const result = await getSlaComplianceBreakdown(superAdmin);

      expect(result.totalTracked).toBe(50);
      expect(result.breached).toBe(5);
      expect(result.compliant).toBe(45);
      expect(result.compliancePercentage).toBe(90);
    });
  });

  describe("getMonthlyTrend", () => {
    it("returns 6 monthly buckets with created and resolved counts", async () => {
      const now = new Date();
      (prisma.grievance.findMany as any).mockResolvedValue([
        { createdAt: now, resolvedAt: now, status: "RESOLVED" },
      ]);

      const trend = await getMonthlyTrend(superAdmin);

      expect(trend).toHaveLength(6);
      expect(trend[5].created).toBe(1);
      expect(trend[5].resolved).toBe(1);
    });
  });

  describe("getGeographicData", () => {
    it("groups grievances by location and calculates coordinate centroids", async () => {
      (prisma.grievance.findMany as any).mockResolvedValue([
        {
          location: "Central Market",
          address: "Sector 1",
          latitude: 28.5,
          longitude: 77.2,
        },
        {
          location: "Central Market",
          address: "Sector 1",
          latitude: 28.52,
          longitude: 77.22,
        },
      ]);

      const geo = await getGeographicData(superAdmin);

      expect(geo).toHaveLength(1);
      expect(geo[0].label).toBe("Central Market");
      expect(geo[0].count).toBe(2);
      expect(geo[0].latitude).toBeCloseTo(28.51, 2);
      expect(geo[0].longitude).toBeCloseTo(77.21, 2);
    });
  });
});
