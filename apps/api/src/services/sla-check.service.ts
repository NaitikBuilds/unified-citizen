import { prisma } from './prisma.service.js';
import { createNotification } from './notification.service.js';

export async function checkAndProcessSLABreaches() {
  try {
    const now = new Date();

    const activeSLAs = await prisma.sLA.findMany({
      where: {
        status: { in: ['ACTIVE', 'WARNING'] },
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
      const isResolutionBreached =
        sla.resolutionDueAt < now && sla.grievance.status !== 'RESOLVED';

      if (isResolutionBreached) {
        breachedIds.push(sla.id);

        // Only transition + notify once per SLA.
        if (sla.status !== 'BREACHED') {
          await prisma.sLA.update({
            where: { id: sla.id },
            data: { status: 'BREACHED', breachedAt: now },
          });

          if (sla.grievance.priority !== 'CRITICAL') {
            await prisma.grievance.update({
              where: { id: sla.grievanceId },
              data: { priority: 'CRITICAL' },
            });
          }

          await createNotification({
            userId: sla.grievance.citizenId,
            title: 'SLA breached',
            message:
              'Your grievance has exceeded its resolution timeline and has been escalated in priority.',
            type: 'SLA_WARNING',
            grievanceId: sla.grievanceId,
          });
        }
      } else if (
        sla.responseDueAt < now &&
        sla.grievance.status !== 'RESOLVED' &&
        sla.status !== 'WARNING'
      ) {
        // Response deadline passed but resolution deadline has not: warning.
        await prisma.sLA.update({
          where: { id: sla.id },
          data: { status: 'WARNING' },
        });

        await createNotification({
          userId: sla.grievance.citizenId,
          title: 'SLA warning',
          message:
            'Your grievance is approaching its resolution deadline. The department has been alerted.',
          type: 'SLA_WARNING',
          grievanceId: sla.grievanceId,
        });
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