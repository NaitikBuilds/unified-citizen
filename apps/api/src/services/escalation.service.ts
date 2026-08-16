import { prisma } from './prisma.service.js';

/**
 * Creates an Escalation record. Must be called inside the caller's
 * transaction so that the escalation row, the grievance status update and
 * the audit entry commit atomically.
 *
 * The caller is responsible for authorization (department/ownership
 * boundaries) and for updating the grievance state.
 */
export async function createEscalation(
  grievanceId: string,
  userId: string,
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADMIN',
  reason: string,
  tx: any = prisma,
) {
  return tx.escalation.create({
    data: {
      grievanceId,
      level,
      status: 'OPEN',
      reason,
      createdById: userId,
      escalatedAt: new Date(),
    },
  });
}