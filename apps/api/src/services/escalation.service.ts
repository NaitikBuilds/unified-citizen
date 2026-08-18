import { prisma } from './prisma.service.js';
import { createAuditLog } from './audit.service.js';

interface EscalationUserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

/**
 * Read a single escalation by its grievance. Returns `null` when the
 * grievance has no escalation record (the canonical escalation mutation
 * updates grievance status but may not persist an Escalation row).
 * HTTP semantics (404/403) are handled by the controller.
 */
export async function getEscalationsByGrievanceId(grievanceId: string) {
  return prisma.escalation.findMany({
    where: { grievanceId },
    orderBy: { escalatedAt: 'desc' },
  });
}

/**
 * List escalations scoped to the authenticated user at the query level.
 * Mirrors the role scoping in `getSlasForUser` (services/sla.service.ts):
 *
 * - CITIZEN            → escalations of grievances the citizen owns
 * - OFFICER / DEPT_ADMIN → escalations of the user's own department
 * - SUPER_ADMIN        → all escalations
 *
 * No client-supplied departmentId is trusted here; the scope is derived from
 * the authenticated session.
 */
export async function getEscalationsForUser(user: EscalationUserContext) {
  if (user.role === 'CITIZEN') {
    return prisma.escalation.findMany({
      where: { grievance: { citizenId: user.userId } },
      orderBy: { escalatedAt: 'desc' },
    });
  }

  if (user.role === 'OFFICER' || user.role === 'DEPARTMENT_ADMIN') {
    if (!user.departmentId) {
      return [];
    }
    return prisma.escalation.findMany({
      where: { grievance: { departmentId: user.departmentId } },
      orderBy: { escalatedAt: 'desc' },
    });
  }

  // SUPER_ADMIN and any future unrestricted role.
  return prisma.escalation.findMany({
    orderBy: { escalatedAt: 'desc' },
  });
}

export async function createEscalation(
  grievanceId: string,
  userId: string,
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADMIN',
  reason: string
) {
  // Create the actual escalation record
  const escalation = await prisma.escalation.create({
    data: {
      grievanceId,
      level,
      status: 'OPEN',
      reason,
      createdById: userId,
      escalatedAt: new Date(),
    },
  });

  // Update grievance status to ESCALATED as specified in the architecture
  await prisma.grievance.update({
    where: { id: grievanceId },
    data: { status: 'ESCALATED' },
  });

  // Record audit log
  await createAuditLog({
    userId,
    grievanceId,
    action: 'ESCALATION_CREATED',
    newValue: level,
    metadata: { reason },
  });

  return escalation;
}