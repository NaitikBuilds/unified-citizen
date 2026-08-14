import { prisma } from './prisma.service.js';

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