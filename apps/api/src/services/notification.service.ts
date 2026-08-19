import { prisma } from './prisma.service.js';
import { NotificationType } from '../generated/prisma/client.js';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  grievanceId?: string;
  tx?: any;
}

// Notification failures must never break the primary workflow they accompany
// (a status change, assignment, escalation, etc.), so creation errors are
// logged and swallowed instead of thrown.
export async function createNotification(params: CreateNotificationParams) {
  const db = params.tx || prisma;
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        // 'SYSTEM' is a valid NotificationType enum value; fall back to it
        // instead of an invalid literal like 'INFO'.
        type: params.type ?? 'SYSTEM',
        isRead: false,
        ...(params.grievanceId ? { grievanceId: params.grievanceId } : {}),
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}