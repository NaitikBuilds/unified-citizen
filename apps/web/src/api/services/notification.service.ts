import type { Paginated } from '../../contracts/api'
import type {
  Notification,
  NotificationListParams,
} from '../../contracts/notification'

export interface NotificationService {
  list(params?: NotificationListParams): Promise<Paginated<Notification>>
  markRead(id: string): Promise<void>
}
