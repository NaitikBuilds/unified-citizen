import type { Paginated } from '../../contracts/api'
import type {
  Notification,
  NotificationListParams,
} from '../../contracts/notification'
import type { NotificationService } from '../../api/services/notification.service'
import { tokenStorage } from '../../auth/tokenStorage'
import { ApiError } from '../../utils/errors'
import { mockNotifications } from '../data/notifications'
import { maybeFail, paginate, simulateLatency } from './mockUtils'

/**
 * MOCK notification service. MOCK ONLY.
 */
export const mockNotificationService: NotificationService = {
  async list(params: NotificationListParams = {}): Promise<Paginated<Notification>> {
    maybeFail('notification.list')
    await simulateLatency()

    const user = tokenStorage.getStoredUser()
    if (!user) {
      throw new ApiError('Unauthorized', 401)
    }

    let results = mockNotifications.filter((item) => item.userId === user.id)
    if (params.unreadOnly) {
      results = results.filter((item) => !item.isRead)
    }

    return paginate(results.map((item) => ({ ...item })), params.page ?? 1, params.limit ?? 10)
  },

  async markRead(id: string): Promise<void> {
    maybeFail('notification.markRead')
    await simulateLatency(100, 250)

    const index = mockNotifications.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Notification not found', 404)
    }
    mockNotifications[index] = { ...mockNotifications[index], isRead: true }
  },
}
