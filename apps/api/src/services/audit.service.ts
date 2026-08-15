import { prisma } from './prisma.service.js';

interface LogAuditParams {
  userId?: string;
  grievanceId?: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export async function createAuditLog(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
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