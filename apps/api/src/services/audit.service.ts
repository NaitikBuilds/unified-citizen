import { prisma } from './prisma.service.js';

interface LogAuditParams {
  userId?: string;
  grievanceId?: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  tx?: any;
}

export async function createAuditLog(params: LogAuditParams): Promise<void> {
  const db = params.tx || prisma;

  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        grievanceId: params.grievanceId || null,
        action: params.action,
        oldValue: params.oldValue !== undefined ? params.oldValue : undefined,
        newValue: params.newValue !== undefined ? params.newValue : undefined,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Prisma include fragment shared by all audit log reads so the response
 * shape stays consistent and the related-field list is maintained in one
 * place.
 */
const auditLogInclude = {
  user: { select: { id: true, name: true } },
  grievance: { select: { id: true, ticketId: true, title: true } },
} as const;

/**
 * Read audit logs for a single grievance. Returns the records ordered by
 * createdAt descending (most recent first). HTTP semantics (404/403) are
 * handled by the controller.
 */
export async function getAuditLogsByGrievanceId(grievanceId: string) {
  return prisma.auditLog.findMany({
    where: { grievanceId },
    include: auditLogInclude,
    orderBy: { createdAt: 'desc' },
  });
}

interface AuditUserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

/**
 * List audit logs scoped to the authenticated user at the query level.
 * Mirrors the role scoping in `getEscalationsForUser` / `getSlasForUser`:
 *
 * - CITIZEN              → audit logs of grievances the citizen owns
 * - OFFICER / DEPT_ADMIN → audit logs of the user's own department
 * - SUPER_ADMIN          → all audit logs
 *
 * No client-supplied departmentId is trusted here; the scope is derived
 * from the authenticated session.
 */
export async function getAuditLogsForUser(user: AuditUserContext) {
  if (user.role === 'CITIZEN') {
    return prisma.auditLog.findMany({
      where: { grievance: { citizenId: user.userId } },
      include: auditLogInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  if (user.role === 'OFFICER' || user.role === 'DEPARTMENT_ADMIN') {
    if (!user.departmentId) {
      return [];
    }
    return prisma.auditLog.findMany({
      where: { grievance: { departmentId: user.departmentId } },
      include: auditLogInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // SUPER_ADMIN and any future unrestricted role.
  return prisma.auditLog.findMany({
    include: auditLogInclude,
    orderBy: { createdAt: 'desc' },
  });
}