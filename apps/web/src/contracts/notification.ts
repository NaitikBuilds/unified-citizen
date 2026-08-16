/**
 * Notification types match the backend enum exactly
 * (source of truth: prisma/schema.prisma `NotificationType`).
 */
export type NotificationType =
  | 'GRIEVANCE_CREATED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'ASSIGNMENT_CHANGED'
  | 'SLA_WARNING'
  | 'ESCALATION_CREATED'
  | 'SYSTEM'

export type Notification = {
  id: string
  userId: string
  grievanceId?: string | null
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export type NotificationListParams = {
  page?: number
  limit?: number
  unreadOnly?: boolean
}
