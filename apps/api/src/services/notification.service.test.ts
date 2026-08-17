import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma.service.js", () => ({
  prisma: {
    notification: { create: vi.fn() },
  },
}));

import { prisma } from "./prisma.service.js";
import { createNotification } from "./notification.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createNotification", () => {
  it("defaults to SYSTEM type and isRead false", async () => {
    (prisma.notification.create as any).mockResolvedValue({ id: "n-1" });

    await createNotification({
      userId: "user-1",
      title: "Hello",
      message: "World",
    });

    const data = (prisma.notification.create as any).mock.calls[0][0].data;
    expect(data.type).toBe("SYSTEM");
    expect(data.isRead).toBe(false);
    expect(data.grievanceId).toBeUndefined();
  });

  it("persists the provided type and grievanceId", async () => {
    (prisma.notification.create as any).mockResolvedValue({ id: "n-1" });

    await createNotification({
      userId: "user-1",
      title: "Escalated",
      message: "Escalated",
      type: "ESCALATION_CREATED",
      grievanceId: "g-1",
    });

    const data = (prisma.notification.create as any).mock.calls[0][0].data;
    expect(data.type).toBe("ESCALATION_CREATED");
    expect(data.grievanceId).toBe("g-1");
  });

  it("swallows database errors and returns null instead of throwing", async () => {
    (prisma.notification.create as any).mockRejectedValue(
      new Error("db down"),
    );

    const result = await createNotification({
      userId: "user-1",
      title: "X",
      message: "Y",
    });

    expect(result).toBeNull();
  });
});
