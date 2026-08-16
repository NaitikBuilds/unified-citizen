import type { Paginated } from '../../contracts/api'
import type {
  Notification,
  NotificationListParams,
} from '../../contracts/notification'

export interface NotificationService {
  list(params?: NotificationListParams): Promise<Paginated<Notification>>
  markRead(id: string): Promise<void>
  /**
   * Marks every unread notification as read. The backend exposes no bulk
   * endpoint, so the real adapter composes the supported per-item PATCHes;
   * the mock implements it natively.
   */
  markAllRead(): Promise<void>
}
