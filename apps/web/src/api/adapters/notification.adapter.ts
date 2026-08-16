import type { Paginated } from '../../contracts/api'
import type {
  Notification,
  NotificationListParams,
} from '../../contracts/notification'
import type { NotificationService } from '../services/notification.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface NotificationsResponse {
  notifications: Notification[]
}

/**
 * REAL API notification adapter (see apps/api/src/controllers/notification.controller.ts).
 */
export const apiNotificationService: NotificationService = {
  async list(params: NotificationListParams = {}): Promise<Paginated<Notification>> {
    const { data } = await client.get<NotificationsResponse>('/notifications')
    let notifications = data.notifications

    if (params.unreadOnly) {
      notifications = notifications.filter((item) => !item.isRead)
    }

    return toPaginated(notifications, params.page, params.limit)
  },

  async markRead(id: string): Promise<void> {
    await client.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    // No bulk endpoint on the backend — compose the supported per-item PATCH.
    const { data } = await client.get<NotificationsResponse>('/notifications')
    const unread = data.notifications.filter((item) => !item.isRead)
    await Promise.all(unread.map((item) => client.patch(`/notifications/${item.id}/read`)))
  },
}
