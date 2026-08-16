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
  GRIEVANCE_CREATED: 'bg-sky-100 text-sky-700',
  STATUS_CHANGED: 'bg-blue-100 text-blue-700',
  COMMENT_ADDED: 'bg-violet-100 text-violet-700',
  ASSIGNMENT_CHANGED: 'bg-emerald-100 text-emerald-700',
  SLA_WARNING: 'bg-amber-100 text-amber-700',
  ESCALATION_CREATED: 'bg-red-100 text-red-700',
  SYSTEM: 'bg-slate-100 text-slate-600',
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Citizen Portal
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
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
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          Mark all as read
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load notifications"
          message={getErrorMessage(query.error)}
          onRetry={query.reload}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No new notifications"
          description="Updates about your grievances — status changes, SLA warnings and replies — will appear here."
        />
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
                    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                    notification.isRead
                      ? 'border-slate-200 bg-white hover:bg-slate-50'
                      : 'border-blue-200 bg-blue-50/60 hover:bg-blue-50',
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
                      <span className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="size-2 rounded-full bg-blue-600" aria-label="Unread" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                  {notification.grievanceId && (
                    <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:block">
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
