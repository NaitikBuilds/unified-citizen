import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma.service.js", () => ({
  prisma: {
    refreshToken: { deleteMany: vi.fn() },
  },
}));

import { prisma } from "./prisma.service.js";
import { cleanupExpiredRefreshTokens } from "./refresh-token-cleanup.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cleanupExpiredRefreshTokens", () => {
  it("deletes only tokens older than 30 days that are revoked or expired", async () => {
    (prisma.refreshToken.deleteMany as any).mockResolvedValue({ count: 3 });

    const deleted = await cleanupExpiredRefreshTokens();

    expect(deleted).toBe(3);

    const where = (prisma.refreshToken.deleteMany as any).mock.calls[0][0].where;

    // Cutoff must be ~30 days in the past.
    const cutoffMs = new Date(where.createdAt.lt).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(Date.now() - cutoffMs).toBeGreaterThan(thirtyDaysMs - 5_000);
    expect(Date.now() - cutoffMs).toBeLessThan(thirtyDaysMs + 5_000);

    // Only dead tokens: revoked OR expired.
    expect(where.OR).toContainEqual({ revokedAt: { not: null } });
    expect(where.OR.some((clause: any) => "expiresAt" in clause)).toBe(true);
  });

  it("returns 0 when nothing matches", async () => {
    (prisma.refreshToken.deleteMany as any).mockResolvedValue({ count: 0 });
    expect(await cleanupExpiredRefreshTokens()).toBe(0);
  });
});
