import { prisma } from './prisma.service.js';
import { createNotification } from './notification.service.js';
import { createAuditLog } from './audit.service.js';

/**
 * Unique 32-bit integer key used for PostgreSQL transaction-level advisory locking
 * to ensure that only one API replica processes SLA breaches at any given time.
 */
export const SLA_ADVISORY_LOCK_KEY = 742901;

export interface SLACheckResult {
  skipped?: boolean;
  checkedCount: number;
  breachedCount: number;
  breachedIds: string[];
}

interface GrievanceLike {
  id: string;
  ticketId: string;
  departmentId: string | null;
}

/**
 * Notifies the staff responsible for a grievance's department that its SLA is
 * at risk/breached: the officer holding the ACTIVE assignment (if any) and the
 * department's administrators. Recipients are deduplicated; failures are
 * swallowed by createNotification so they never break the SLA processing.
 */
async function notifyDepartmentRecipients(
  grievance: GrievanceLike,
  title: string,
  message: string,
  tx: any,
): Promise<void> {
  if (!grievance.departmentId) {
    return;
  }

  const [admins, activeAssignment] = await Promise.all([
    tx.user.findMany({
      where: {
        departmentId: grievance.departmentId,
        role: 'DEPARTMENT_ADMIN',
      },
      select: { id: true },
    }),
    tx.assignment.findFirst({
      where: { grievanceId: grievance.id, status: 'ACTIVE' },
      select: { officerId: true },
    }),
  ]);

  const recipientIds = new Set<string>();
  for (const admin of admins) {
    recipientIds.add(admin.id);
  }
  if (activeAssignment) {
    recipientIds.add(activeAssignment.officerId);
  }

  for (const userId of recipientIds) {
    await createNotification({
      userId,
      title,
      message,
      type: 'SLA_WARNING',
      grievanceId: grievance.id,
      tx,
    });
  }
}

export async function checkAndProcessSLABreaches(): Promise<SLACheckResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Acquire transaction-level advisory lock. If another instance is running,
      // pg_try_advisory_xact_lock returns false immediately without waiting.
      const lockResult = await tx.$queryRaw<Array<{ acquired: boolean }>>`
        SELECT pg_try_advisory_xact_lock(${SLA_ADVISORY_LOCK_KEY}) AS acquired
      `;

      const acquired = lockResult[0]?.acquired === true;
      if (!acquired) {
        return {
          skipped: true,
          checkedCount: 0,
          breachedCount: 0,
          breachedIds: [],
        };
      }

      const now = new Date();

      const activeSLAs = await tx.sLA.findMany({
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
        // RESOLVED and REJECTED are terminal states: their SLA is completed by
        // the status transition and must never accrue warning/breach states.
        const isTerminal = ['RESOLVED', 'REJECTED'].includes(
          sla.grievance.status,
        );

        const isResolutionBreached =
          sla.resolutionDueAt < now && !isTerminal;

        if (isResolutionBreached) {
          breachedIds.push(sla.id);

          // Only transition + notify once per SLA.
          if (sla.status !== 'BREACHED') {
            await tx.sLA.update({
              where: { id: sla.id },
              data: { status: 'BREACHED', breachedAt: now },
            });

            if (sla.grievance.priority !== 'CRITICAL') {
              await tx.grievance.update({
                where: { id: sla.grievanceId },
                data: { priority: 'CRITICAL' },
              });

              // System-initiated priority escalation must be auditable.
              await createAuditLog({
                grievanceId: sla.grievanceId,
                action: 'SLA_PRIORITY_ESCALATED',
                oldValue: { priority: sla.grievance.priority },
                newValue: { priority: 'CRITICAL' },
                metadata: { slaId: sla.id },
                tx,
              });
            }

            await createNotification({
              userId: sla.grievance.citizenId,
              title: 'SLA breached',
              message:
                'Your grievance has exceeded its resolution timeline and has been escalated in priority.',
              type: 'SLA_WARNING',
              grievanceId: sla.grievanceId,
              tx,
            });

            await notifyDepartmentRecipients(
              sla.grievance,
              'Grievance SLA breached',
              `Grievance ${sla.grievance.ticketId} has exceeded its resolution timeline and its priority has been raised.`,
              tx,
            );
          }
        } else if (
          sla.responseDueAt < now &&
          !isTerminal &&
          sla.status !== 'WARNING'
        ) {
          // Response deadline passed but resolution deadline has not: warning.
          await tx.sLA.update({
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
            tx,
          });

          await notifyDepartmentRecipients(
            sla.grievance,
            'Grievance SLA warning',
            `Grievance ${sla.grievance.ticketId} is approaching its resolution deadline and needs attention.`,
            tx,
          );
        }
      }

      return {
        skipped: false,
        checkedCount: activeSLAs.length,
        breachedCount: breachedIds.length,
        breachedIds,
      };
    });
  } catch (error) {
    console.error('Error processing SLA breaches:', error);
    throw error;
  }
}