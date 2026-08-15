import { prisma } from './prisma.service.js';
import { createAuditLog } from './audit.service.js';

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