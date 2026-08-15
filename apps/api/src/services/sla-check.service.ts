import { prisma } from './prisma.service.js';

export async function checkAndProcessSLABreaches() {
  try {
    const now = new Date();

    const activeSLAs = await prisma.sLA.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { responseDueAt: { lt: now } },
          { resolutionDueAt: { lt: now } },
        ],
      },
      include: {
        grievance: true,
      },
    });

    const breachedIds: string[] = [];

    for (const sla of activeSLAs) {
      const isResolutionBreached = sla.resolutionDueAt < now;
      
      // Removed 'CLOSED' since it's not part of the GrievanceStatus enum
      if (isResolutionBreached && sla.grievance.status !== 'RESOLVED') {
        breachedIds.push(sla.id);

        await prisma.sLA.update({
          where: { id: sla.id },
          data: { status: 'BREACHED' },
        });

        if (sla.grievance.priority !== 'CRITICAL') {
          await prisma.grievance.update({
            where: { id: sla.grievanceId },
            data: { priority: 'CRITICAL' },
          });
        }
      }
    }

    return {
      checkedCount: activeSLAs.length,
      breachedCount: breachedIds.length,
      breachedIds,
    };
  } catch (error) {
    console.error('Error processing SLA breaches:', error);
    throw error;
  }
}