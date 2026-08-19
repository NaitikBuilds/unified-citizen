import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { generateAccessToken } from "../services/jwt.service.js";

vi.mock("../services/prisma.service.js", () => ({
  prisma: {
    grievance: {
      groupBy: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    sLA: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    feedback: {
      aggregate: vi.fn().mockResolvedValue({ _avg: { rating: null } }),
    },
    department: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

const superAdminToken = generateAccessToken({
  userId: "admin-1",
  email: "admin@gov.in",
  role: "SUPER_ADMIN",
  departmentId: null,
});

const deptAdminToken = generateAccessToken({
  userId: "dept-admin-1",
  email: "deptadmin@gov.in",
  role: "DEPARTMENT_ADMIN",
  departmentId: "dept-123",
});

const citizenToken = generateAccessToken({
  userId: "citizen-1",
  email: "citizen@gov.in",
  role: "CITIZEN",
  departmentId: null,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Analytics Endpoints (RBAC & Integration)", () => {
  describe("GET /api/v1/analytics/summary", () => {
    it("returns 200 and summary object for SUPER_ADMIN", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/summary")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("summary");
      expect(res.body.summary).toHaveProperty("total", 0);
      expect(res.body.summary).toHaveProperty("pending", 0);
    });

    it("returns 200 for DEPARTMENT_ADMIN", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/summary")
        .set("Authorization", `Bearer ${deptAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("summary");
    });

    it("returns 403 Forbidden for CITIZEN", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/summary")
        .set("Authorization", `Bearer ${citizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await request(app).get("/api/v1/analytics/summary");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/analytics/status-distribution", () => {
    it("returns 200 and statusDistribution array", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/status-distribution")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("statusDistribution");
      expect(Array.isArray(res.body.statusDistribution)).toBe(true);
    });
  });

  describe("GET /api/v1/analytics/department-performance", () => {
    it("returns 200 and departmentPerformance array", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/department-performance")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("departmentPerformance");
      expect(Array.isArray(res.body.departmentPerformance)).toBe(true);
    });
  });

  describe("GET /api/v1/analytics/sla-compliance", () => {
    it("returns 200 and slaCompliance breakdown", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/sla-compliance")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("slaCompliance");
      expect(res.body.slaCompliance).toHaveProperty("compliancePercentage", 100);
    });
  });
});
