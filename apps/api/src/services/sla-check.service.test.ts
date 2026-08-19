import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTx: any = {
  $queryRaw: vi.fn(),
  sLA: { findMany: vi.fn(), update: vi.fn() },
  grievance: { update: vi.fn() },
  user: { findMany: vi.fn() },
  assignment: { findFirst: vi.fn() },
};

vi.mock("./prisma.service.js", () => ({
  prisma: {
    $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockTx)),
    $queryRaw: vi.fn(),
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
import {
  checkAndProcessSLABreaches,
  SLA_ADVISORY_LOCK_KEY,
} from "./sla-check.service.js";

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
  (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx));
  (mockTx.$queryRaw as any).mockResolvedValue([{ acquired: true }]);
  (mockTx.assignment.findFirst as any).mockResolvedValue(null);
  (mockTx.user.findMany as any).mockResolvedValue([]);
  (mockTx.sLA.findMany as any).mockResolvedValue([]);
  (mockTx.sLA.update as any).mockResolvedValue({});
  (mockTx.grievance.update as any).mockResolvedValue({});
});

describe("checkAndProcessSLABreaches with advisory locking", () => {
  describe("Concurrency & Lock Behavior", () => {
    it("processes breaches when advisory lock is successfully acquired", async () => {
      (mockTx.$queryRaw as any).mockResolvedValue([{ acquired: true }]);
      (mockTx.sLA.findMany as any).mockResolvedValue([makeSla()]);

      const result = await checkAndProcessSLABreaches();

      expect(result.skipped).toBe(false);
      expect(result.breachedCount).toBe(1);
      expect(mockTx.$queryRaw).toHaveBeenCalled();
      expect(mockTx.sLA.findMany).toHaveBeenCalled();
    });

    it("skips execution immediately without processing when advisory lock is busy (returns false)", async () => {
      (mockTx.$queryRaw as any).mockResolvedValue([{ acquired: false }]);

      const result = await checkAndProcessSLABreaches();

      expect(result).toEqual({
        skipped: true,
        checkedCount: 0,
        breachedCount: 0,
        breachedIds: [],
      });
      // Ensure no queries, updates, audits or notifications occurred
      expect(mockTx.sLA.findMany).not.toHaveBeenCalled();
      expect(mockTx.sLA.update).not.toHaveBeenCalled();
      expect(mockTx.grievance.update).not.toHaveBeenCalled();
      expect(createAuditLog).not.toHaveBeenCalled();
      expect(createNotification).not.toHaveBeenCalled();
    });

    it("propagates error and rolls back transaction if an unexpected error occurs during processing", async () => {
      (mockTx.$queryRaw as any).mockResolvedValue([{ acquired: true }]);
      (mockTx.sLA.findMany as any).mockRejectedValue(new Error("Database connection lost"));

      await expect(checkAndProcessSLABreaches()).rejects.toThrow("Database connection lost");
    });

    it("propagates the transaction client (tx) to createAuditLog and createNotification", async () => {
      (mockTx.$queryRaw as any).mockResolvedValue([{ acquired: true }]);
      (mockTx.sLA.findMany as any).mockResolvedValue([makeSla()]);

      await checkAndProcessSLABreaches();

      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          tx: mockTx,
          action: "SLA_PRIORITY_ESCALATED",
        }),
      );
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          tx: mockTx,
        }),
      );
    });

    it("defines the expected constant SLA_ADVISORY_LOCK_KEY", () => {
      expect(SLA_ADVISORY_LOCK_KEY).toBe(742901);
    });
  });

  describe("SLA Status Transition & Notification Semantics", () => {
    it("does not touch terminal RESOLVED/REJECTED grievances", async () => {
      (mockTx.sLA.findMany as any).mockResolvedValue([
        makeSla({ grievance: { ...makeSla().grievance, status: "RESOLVED" } }),
      ]);

      const result = await checkAndProcessSLABreaches();

      expect(result.breachedCount).toBe(0);
      expect(mockTx.sLA.update).not.toHaveBeenCalled();
      expect(createNotification).not.toHaveBeenCalled();
    });

    it("marks an overdue grievance BREACHED, escalates priority with audit, and notifies citizen + department", async () => {
      (mockTx.sLA.findMany as any).mockResolvedValue([makeSla()]);
      (mockTx.user.findMany as any).mockResolvedValue([{ id: "admin-1" }]);
      (mockTx.assignment.findFirst as any).mockResolvedValue({
        officerId: "officer-1",
      });

      const result = await checkAndProcessSLABreaches();

      expect(result.breachedCount).toBe(1);
      expect(mockTx.sLA.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "BREACHED" }),
        }),
      );
      // Priority escalated and audited.
      expect(mockTx.grievance.update).toHaveBeenCalledWith(
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
          tx: mockTx,
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
      (mockTx.sLA.findMany as any).mockResolvedValue([
        makeSla({ status: "BREACHED" }),
      ]);

      const result = await checkAndProcessSLABreaches();

      expect(result.breachedCount).toBe(1); // still counted as breached
      expect(mockTx.sLA.update).not.toHaveBeenCalled();
      expect(createNotification).not.toHaveBeenCalled();
      expect(createAuditLog).not.toHaveBeenCalled();
    });

    it("does not change priority or audit when the grievance is already CRITICAL", async () => {
      (mockTx.sLA.findMany as any).mockResolvedValue([
        makeSla({
          grievance: { ...makeSla().grievance, priority: "CRITICAL" },
        }),
      ]);

      await checkAndProcessSLABreaches();

      expect(mockTx.grievance.update).not.toHaveBeenCalled();
      expect(createAuditLog).not.toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled(); // citizen breach notice still sent
    });

    it("sends a WARNING (and department notice) when only the response deadline passed", async () => {
      (mockTx.sLA.findMany as any).mockResolvedValue([
        makeSla({ resolutionDueAt: future }),
      ]);
      (mockTx.user.findMany as any).mockResolvedValue([{ id: "admin-1" }]);

      await checkAndProcessSLABreaches();

      expect(mockTx.sLA.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "WARNING" }),
        }),
      );
      const notifiedUserIds = (createNotification as any).mock.calls.map(
        (c: any[]) => c[0].userId,
      );
      expect(notifiedUserIds).toContain("citizen-1");
      expect(notifiedUserIds).toContain("admin-1");
      expect(new Set(notifiedUserIds).size).toBe(notifiedUserIds.length);
    });

    it("does not re-warn an SLA that is already in WARNING status", async () => {
      (mockTx.sLA.findMany as any).mockResolvedValue([
        makeSla({ resolutionDueAt: future, status: "WARNING" }),
      ]);

      await checkAndProcessSLABreaches();

      expect(mockTx.sLA.update).not.toHaveBeenCalled();
      expect(createNotification).not.toHaveBeenCalled();
    });
  });
});
