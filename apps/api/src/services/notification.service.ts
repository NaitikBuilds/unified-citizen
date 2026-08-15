import { prisma } from './prisma.service.js';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: (params.type || 'INFO') as any,
        isRead: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}