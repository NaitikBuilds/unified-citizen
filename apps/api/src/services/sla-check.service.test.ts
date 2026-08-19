import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma.service.js", () => ({
  prisma: {
    sLA: { findMany: vi.fn(), update: vi.fn() },
    grievance: { update: vi.fn() },
    user: { findMany: vi.fn() },
    assignment: { findFirst: vi.fn() },
  },
}));

vi.mock("./notification.service.js", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));

vi.mock("./audit.service.js", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "./prisma.service.js";
import { createNotification } from "./notification.service.js";
import { createAuditLog } from "./audit.service.js";
import { checkAndProcessSLABreaches } from "./sla-check.service.js";

const now = Date.now();
const past = new Date(now - 60_000);
const future = new Date(now + 60_000);

function makeSla(overrides: Record<string, any> = {}) {
  return {
    id: "sla-1",
    grievanceId: "g-1",
    status: "ACTIVE",
    responseDueAt: past,
    resolutionDueAt: past,
    grievance: {
      id: "g-1",
      ticketId: "GRV-1",
      citizenId: "citizen-1",
      departmentId: "dept-1",
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  (prisma.assignment.findFirst as any).mockResolvedValue(null);
  (prisma.user.findMany as any).mockResolvedValue([]);
});

describe("checkAndProcessSLABreaches", () => {
  it("does not touch terminal RESOLVED/REJECTED grievances", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([
      makeSla({ grievance: { ...makeSla().grievance, status: "RESOLVED" } }),
    ]);

    const result = await checkAndProcessSLABreaches();

    expect(result.breachedCount).toBe(0);
    expect(prisma.sLA.update).not.toHaveBeenCalled();
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("marks an overdue grievance BREACHED, escalates priority with audit, and notifies citizen + department", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([makeSla()]);
    (prisma.user.findMany as any).mockResolvedValue([{ id: "admin-1" }]);
    (prisma.assignment.findFirst as any).mockResolvedValue({
      officerId: "officer-1",
    });

    const result = await checkAndProcessSLABreaches();

    expect(result.breachedCount).toBe(1);
    expect(prisma.sLA.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "BREACHED" }),
      }),
    );
    // Priority escalated and audited.
    expect(prisma.grievance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: "CRITICAL" }),
      }),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SLA_PRIORITY_ESCALATED",
        grievanceId: "g-1",
        oldValue: { priority: "HIGH" },
        newValue: { priority: "CRITICAL" },
      }),
    );
    // Citizen + assigned officer + department admin each notified once.
    const notifiedUserIds = (createNotification as any).mock.calls.map(
      (c: any[]) => c[0].userId,
    );
    expect(notifiedUserIds).toContain("citizen-1");
    expect(notifiedUserIds).toContain("officer-1");
    expect(notifiedUserIds).toContain("admin-1");
    expect(new Set(notifiedUserIds).size).toBe(notifiedUserIds.length);
  });

  it("does not re-notify or re-transition an already BREACHED SLA", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([
      makeSla({ status: "BREACHED" }),
    ]);

    const result = await checkAndProcessSLABreaches();

    expect(result.breachedCount).toBe(1); // still counted as breached
    expect(prisma.sLA.update).not.toHaveBeenCalled();
    expect(createNotification).not.toHaveBeenCalled();
    expect(createAuditLog).not.toHaveBeenCalled();
  });

  it("does not change priority or audit when the grievance is already CRITICAL", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([
      makeSla({
        grievance: { ...makeSla().grievance, priority: "CRITICAL" },
      }),
    ]);

    await checkAndProcessSLABreaches();

    expect(prisma.grievance.update).not.toHaveBeenCalled();
    expect(createAuditLog).not.toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalled(); // citizen breach notice still sent
  });

  it("sends a WARNING (and department notice) when only the response deadline passed", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([
      makeSla({ resolutionDueAt: future }),
    ]);
    (prisma.user.findMany as any).mockResolvedValue([{ id: "admin-1" }]);

    await checkAndProcessSLABreaches();

    expect(prisma.sLA.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "WARNING" }),
      }),
    );
    const notifiedUserIds = (createNotification as any).mock.calls.map(
      (c: any[]) => c[0].userId,
    );
    expect(notifiedUserIds).toContain("citizen-1");
    expect(notifiedUserIds).toContain("admin-1");
    expect(createAuditLog).not.toHaveBeenCalled();
  });

  it("does not warn twice for the same SLA", async () => {
    (prisma.sLA.findMany as any).mockResolvedValue([
      makeSla({ status: "WARNING", resolutionDueAt: future }),
    ]);

    await checkAndProcessSLABreaches();

    expect(prisma.sLA.update).not.toHaveBeenCalled();
    expect(createNotification).not.toHaveBeenCalled();
  });
});
