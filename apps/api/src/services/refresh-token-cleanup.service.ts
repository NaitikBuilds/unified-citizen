import { prisma } from "./prisma.service.js";

// Only tokens that are already dead (revoked or expired) and older than this
// cutoff are deleted. Active or recently-rotated tokens are never touched.
const CLEANUP_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Deletes expired/revoked refresh tokens older than 30 days.
 *
 * Returns the number of deleted rows. Failures must be handled by the caller
 * (logged, never fatal to the server).
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  const cutoff = new Date(Date.now() - CLEANUP_AGE_MS);

  const result = await prisma.refreshToken.deleteMany({
    where: {
      createdAt: { lt: cutoff },
      OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
    },
  });

  return result.count;
}
