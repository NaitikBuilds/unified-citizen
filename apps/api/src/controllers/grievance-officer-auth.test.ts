import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/prisma.service.js", () => ({
  prisma: {
    grievance: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
    },
    escalation: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "../services/prisma.service.js";
import {
  updateGrievance,
  escalateGrievance,
  updateGrievanceStatus,
} from "./grievance.controller.js";

function mockRes() {
  const res: any = {
    statusCode: 0,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      // Express uses 200 as the default status when json() is called directly.
      res.statusCode = res.statusCode || 200;
      res.body = payload;
      return res;
    },
  };
  return res;
}

const grievanceInDept = {
  id: "grievance-1",
  citizenId: "citizen-1",
  departmentId: "dept-1",
  status: "IN_PROGRESS",
  priority: "HIGH",
  title: "Pothole on Main Street",
  description: "Large pothole blocking traffic.",
  category: "ROADS",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const assignedOfficer = {
  userId: "officer-1",
  role: "OFFICER",
  departmentId: "dept-1",
  email: "officer1@example.com",
};

const crossDeptOfficer = {
  userId: "officer-2",
  role: "OFFICER",
  departmentId: "dept-2",
  email: "officer2@example.com",
};

const noDeptOfficer = {
  userId: "officer-3",
  role: "OFFICER",
  departmentId: null,
  email: "officer3@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
  (prisma.$transaction as any).mockImplementation(async (fn: (...args: any[]) => any) =>
    fn({
      grievance: {
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue(grievanceInDept),
      },
      escalation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "escalation-1" }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    }),
  );
});

describe("updateGrievance — officer write authorization (F-12)", () => {
  it("rejects an officer with no department (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);

    const res = mockRes();
    await updateGrievance(
      { user: noDeptOfficer, params: { id: "grievance-1" }, body: {} } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
  });

  it("rejects a cross-department officer even if they know the grievance id (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);

    const res = mockRes();
    await updateGrievance(
      { user: crossDeptOfficer, params: { id: "grievance-1" }, body: {} } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(prisma.assignment.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a same-department officer without an ACTIVE assignment (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);
    (prisma.assignment.findFirst as any).mockResolvedValue(null);

    const res = mockRes();
    await updateGrievance(
      { user: assignedOfficer, params: { id: "grievance-1" }, body: {} } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(prisma.assignment.findFirst).toHaveBeenCalledWith({
      where: { grievanceId: "grievance-1", officerId: "officer-1", status: "ACTIVE" },
      select: { id: true },
    });
  });

  it("allows an officer with an ACTIVE assignment on their own grievance", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);
    (prisma.assignment.findFirst as any).mockResolvedValue({ id: "assignment-1" });

    const res = mockRes();
    await updateGrievance(
      {
        user: assignedOfficer,
        params: { id: "grievance-1" },
        body: { title: "Updated title" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("updated");
  });
});

describe("escalateGrievance — officer write authorization (F-12)", () => {
  it("rejects an officer with no department (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);

    const res = mockRes();
    await escalateGrievance(
      {
        user: noDeptOfficer,
        params: { id: "grievance-1" },
        body: { level: "LEVEL_1", reason: "Needs urgent attention" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
  });

  it("rejects a cross-department officer (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);

    const res = mockRes();
    await escalateGrievance(
      {
        user: crossDeptOfficer,
        params: { id: "grievance-1" },
        body: { level: "LEVEL_1", reason: "Needs urgent attention" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(prisma.assignment.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a same-department officer without an ACTIVE assignment (403)", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);
    (prisma.assignment.findFirst as any).mockResolvedValue(null);

    const res = mockRes();
    await escalateGrievance(
      {
        user: assignedOfficer,
        params: { id: "grievance-1" },
        body: { level: "LEVEL_1", reason: "Needs urgent attention" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
  });

  it("sets resolvedAt when an officer transitions a grievance to RESOLVED", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);
    (prisma.assignment.findFirst as any).mockResolvedValue({
      id: "assignment-1",
    });

    let capturedTx: any;
    (prisma.$transaction as any).mockImplementation(async (fn: any) => {
      capturedTx = {
        grievance: {
          update: vi.fn().mockResolvedValue(grievanceInDept),
        },
        sLA: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(capturedTx);
    });

    const res = mockRes();
    await updateGrievanceStatus(
      {
        user: assignedOfficer,
        params: { id: "grievance-1" },
        body: { status: "RESOLVED" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(capturedTx.grievance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "RESOLVED",
          resolvedAt: expect.any(Date),
        }),
      }),
    );
    // Resolving completes the SLA lifecycle.
    expect(capturedTx.sLA.updateMany).toHaveBeenCalled();
  });

  it("allows an assigned officer to escalate their own grievance", async () => {
    (prisma.grievance.findUnique as any).mockResolvedValue(grievanceInDept);
    (prisma.assignment.findFirst as any).mockResolvedValue({ id: "assignment-1" });

    const res = mockRes();
    await escalateGrievance(
      {
        user: assignedOfficer,
        params: { id: "grievance-1" },
        body: { level: "LEVEL_1", reason: "Needs urgent attention" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("escalated");
  });
});
