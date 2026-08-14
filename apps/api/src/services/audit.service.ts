import { prisma } from './prisma.service.js';

export async function logAudit(userId: string, action: string, details?: string): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    // Log failure to console so it doesn't crash the main request flow
    console.error('Failed to create audit log:', error);
  }
}