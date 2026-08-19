import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/prisma.service.js", () => ({
  prisma: {
    grievance: {
      findUnique: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "../services/prisma.service.js";
import { getGrievanceById } from "./grievance.controller.js";

function mockRes() {
  const res: any = {
    statusCode: 0,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      res.statusCode = res.statusCode || 200;
      res.body = payload;
      return res;
    },
  };
  return res;
}

describe("getGrievanceById with AI classification & RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const grievanceWithAI = {
    id: "grv-1",
    citizenId: "citizen-1",
    departmentId: "dept-1",
    status: "SUBMITTED",
    priority: "HIGH",
    title: "Broken water pipe",
    description: "Water flooding street",
    category: "WATER",
    aiClassification: {
      id: "ai-1",
      grievanceId: "grv-1",
      category: "WATER",
      department: "WATER_SUPPLY",
      priority: "HIGH",
      severity: "HIGH",
      confidence: 0.95,
      summary: "Water pipe rupture reported",
      explanation: "Classified based on flooding keywords",
      duplicateScore: 0.05,
    },
    citizen: { id: "citizen-1", name: "Alice Citizen", email: "alice@example.com" },
    department: { id: "dept-1", name: "Water Department" },
  };

  it("includes aiClassification when queried via Prisma", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceWithAI);

    const res = mockRes();
    await getGrievanceById(
      {
        user: { userId: "citizen-1", role: "CITIZEN" },
        params: { id: "grv-1" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(prisma.grievance.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "grv-1" },
        include: expect.objectContaining({
          aiClassification: true,
          citizen: expect.any(Object),
          department: expect.any(Object),
        }),
      }),
    );
    expect(res.body.grievance.aiClassification).toBeDefined();
    expect(res.body.grievance.aiClassification.category).toBe("WATER");
    expect(res.body.grievance.aiClassification.severity).toBe("HIGH");
  });

  it("blocks citizen from accessing other citizen's grievance AI details", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceWithAI);

    const res = mockRes();
    await getGrievanceById(
      {
        user: { userId: "other-citizen", role: "CITIZEN" },
        params: { id: "grv-1" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("blocks officer from other department from accessing grievance", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceWithAI);

    const res = mockRes();
    await getGrievanceById(
      {
        user: { userId: "officer-2", role: "OFFICER", departmentId: "dept-2" },
        params: { id: "grv-1" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("allows assigned officer in same department to access grievance AI details", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceWithAI);
    (prisma.assignment.findFirst as any).mockResolvedValue({ id: "assignment-1" });

    const res = mockRes();
    await getGrievanceById(
      {
        user: { userId: "officer-1", role: "OFFICER", departmentId: "dept-1" },
        params: { id: "grv-1" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.grievance.aiClassification.summary).toBe("Water pipe rupture reported");
  });

  it("allows super admin to access grievance AI details unconditionally", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceWithAI);

    const res = mockRes();
    await getGrievanceById(
      {
        user: { userId: "admin-1", role: "SUPER_ADMIN" },
        params: { id: "grv-1" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.grievance.aiClassification).toBeDefined();
  });
});
