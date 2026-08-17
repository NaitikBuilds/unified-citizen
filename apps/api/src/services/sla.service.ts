import { prisma } from './prisma.service.js';

interface SlaUserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

/**
 * Read a single SLA by its grievance. Returns `null` when the grievance has
 * no SLA record yet (SLA creation is asynchronous to grievance creation).
 * HTTP semantics (404/403) are handled by the controller.
 */
export async function getSlaByGrievanceId(grievanceId: string) {
  return prisma.sLA.findUnique({
    where: { grievanceId },
  });
}

/**
 * List SLAs scoped to the authenticated user at the query level.
 * Mirrors the role scoping in `findGrievances` (apps/api/src/services/grievance.service.ts):
 *
 * - CITIZEN            → SLAs of grievances the citizen owns
 * - OFFICER / DEPT_ADMIN → SLAs of the user's own department
 * - SUPER_ADMIN        → all SLAs
 *
 * No client-supplied departmentId is trusted here; the scope is derived from
 * the authenticated session.
 */
export async function getSlasForUser(user: SlaUserContext) {
  if (user.role === 'CITIZEN') {
    return prisma.sLA.findMany({
      where: { grievance: { citizenId: user.userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (user.role === 'OFFICER' || user.role === 'DEPARTMENT_ADMIN') {
    if (!user.departmentId) {
      return [];
    }
    return prisma.sLA.findMany({
      where: { departmentId: user.departmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // SUPER_ADMIN and any future unrestricted role.
  return prisma.sLA.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSLAForGrievance(grievanceId: string, departmentId: string, priority: string) {
  try {
    // Find matching SLA policy for the department and priority
    let policy = await prisma.sLAPolicy.findFirst({
      where: {
        departmentId,
        priority: priority as any,
        isActive: true,
      },
    });

    // Fallback to department policy without specific priority if not found
    if (!policy) {
      policy = await prisma.sLAPolicy.findFirst({
        where: {
          departmentId,
          priority: null,
          isActive: true,
        },
      });
    }

    // Default hours if no policy exists
    const responseTimeHours = policy ? policy.responseTimeHours : 24;
    const resolutionTimeHours = policy ? policy.resolutionTimeHours : 72;

    const now = new Date();
    const responseDueAt = new Date(now.getTime() + responseTimeHours * 60 * 60 * 1000);
    const resolutionDueAt = new Date(now.getTime() + resolutionTimeHours * 60 * 60 * 1000);

    const sla = await prisma.sLA.create({
      data: {
        grievanceId,
        departmentId,
        policyId: policy?.id || null,
        responseTimeHours,
        resolutionTimeHours,
        responseDueAt,
        resolutionDueAt,
        status: 'ACTIVE',
      },
    });

    return sla;
  } catch (error) {
    console.error('Error creating SLA for grievance:', error);
    throw error;
  }
}