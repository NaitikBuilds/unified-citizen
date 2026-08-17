import { prisma } from './prisma.service.js';

/**
 * Creates an SLA for a grievance.
 *
 * - Must be called inside the same transaction that creates the grievance so
 *   that a failed SLA creation rolls back the grievance (no orphaned rows).
 * - When `departmentId` is absent the grievance has no department and no SLA
 *   policy can apply; the SLA is skipped (the Grievance -> SLA relation is
 *   optional in the schema) instead of running an un-scoped policy lookup or
 *   writing an invalid SLA.
 * - Policy lookup is always scoped to the provided department.
 */
export async function createSLAForGrievance(
  grievanceId: string,
  departmentId: string | null | undefined,
  priority: string,
  tx: any = prisma,
) {
  if (!departmentId) {
    return null;
  }

  // Find matching SLA policy for the department and priority
  let policy = await tx.sLAPolicy.findFirst({
    where: {
      departmentId,
      priority: priority as any,
      isActive: true,
    },
  });

  // Fallback to department policy without specific priority if not found
  if (!policy) {
    policy = await tx.sLAPolicy.findFirst({
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

  const sla = await tx.sLA.create({
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
}