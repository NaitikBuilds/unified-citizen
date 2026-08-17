import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellOff,
  CheckCheck,
  Clock,
  FilePlus,
  Info,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  UserPlus,
} from 'lucide-react'
import type { Notification, NotificationType } from '../../contracts/notification'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import { formatRelativeTime } from '../../utils/format'
import { Button, EmptyState, ErrorState, Skeleton } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { cn } from '../../utils/cn'
import { notifyNotificationsChanged } from '../../components/notifications/events'

const TYPE_ICONS: Record<NotificationType, typeof Info> = {
  GRIEVANCE_CREATED: FilePlus,
  STATUS_CHANGED: RefreshCw,
  COMMENT_ADDED: MessageSquare,
  ASSIGNMENT_CHANGED: UserPlus,
  SLA_WARNING: Clock,
  ESCALATION_CREATED: ShieldAlert,
  SYSTEM: Info,
}

const TYPE_ACCENTS: Record<NotificationType, string> = {
  GRIEVANCE_CREATED: 'bg-ucg-blue/10 text-ucg-blue',
  STATUS_CHANGED: 'bg-ucg-electric/10 text-ucg-electric',
  COMMENT_ADDED: 'bg-violet-500/10 text-violet-700',
  ASSIGNMENT_CHANGED: 'bg-emerald-500/10 text-emerald-700',
  SLA_WARNING: 'bg-amber-500/10 text-amber-700',
  ESCALATION_CREATED: 'bg-red-500/10 text-red-700',
  SYSTEM: 'bg-ucg-fog text-slate-600',
}

/** Notification center — Member 4, Step 94. */
export function NotificationsPage() {
  const navigate = useNavigate()
  const { success: successToast, error: errorToast } = useToast()

  const query = useAsync(() => services.notification.list({ limit: 50 }))
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data.items)
    }
  }, [query.data])

  async function markRead(notification: Notification): Promise<void> {
    if (notification.isRead || isMutating) {
      return
    }
    setIsMutating(true)
    try {
      await services.notification.markRead(notification.id)
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      )
      notifyNotificationsChanged()
    } catch (markError) {
      errorToast({
        title: 'Could not update notification',
        description: getErrorMessage(markError),
      })
    } finally {
      setIsMutating(false)
    }
  }

  async function handleOpen(notification: Notification): Promise<void> {
    await markRead(notification)
    if (notification.grievanceId) {
      navigate(`/citizen/grievances/${notification.grievanceId}`)
    }
  }

  async function markAllRead(): Promise<void> {
    if (isMutating) {
      return
    }
    const unreadCount = notifications.filter((item) => !item.isRead).length
    if (unreadCount === 0) {
      return
    }
    setIsMutating(true)
    try {
      await services.notification.markAllRead()
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
      notifyNotificationsChanged()
      successToast({
        title: 'All notifications marked as read',
      })
    } catch (markError) {
      errorToast({
        title: 'Could not mark notifications as read',
        description: getErrorMessage(markError),
      })
    } finally {
      setIsMutating(false)
    }
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-mono flex items-center gap-2 text-slate-400">
            <span className="size-1.5 rounded-full bg-ucg-blue" aria-hidden="true" />
            Citizen Portal / Activity
          </p>
          <h2 className="mt-2 font-editorial text-3xl font-semibold tracking-tight text-ucg-ink">
            Notifications
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'You are all caught up'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={unreadCount === 0 || isMutating}
          className="ucg-btn-pill"
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          Mark all as read
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2" role="status" aria-label="Loading notifications">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-ucg-fog bg-white px-4 py-3.5"
            >
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load notifications"
          message={getErrorMessage(query.error)}
          onRetry={query.reload}
        />
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-ucg-fog bg-white p-4">
          <EmptyState
            icon={BellOff}
            title="No new notifications"
            description="Updates about your grievances — status changes, SLA warnings and replies — will appear here."
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type]
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={cn(
                    'nt-row focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                    !notification.isRead && 'nt-row-unread',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                      TYPE_ACCENTS[notification.type],
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="nt-title">{notification.title}</span>
                      {!notification.isRead && (
                        <span className="size-2 rounded-full bg-ucg-blue" aria-label="Unread" />
                      )}
                    </span>
                    <span className="nt-message block">{notification.message}</span>
                    <span className="nt-time block">{formatRelativeTime(notification.createdAt)}</span>
                  </span>
                  {notification.grievanceId && (
                    <span className="nt-id hidden shrink-0 sm:block">
                      {notification.grievanceId}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
