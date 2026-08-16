import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface NotificationBellProps {
  /** Number of unread notifications; hidden when undefined or 0. */
  unreadCount?: number
  /** Pulsing accent when a new unread state appears (respects reduced motion). */
  pulse?: boolean
  className?: string
}

/**
 * Topbar entry point to the notification center. Step 86 ships the link;
 * Step 94 adds the unread badge and pulse fed by the notification service.
 */
export function NotificationBell({
  unreadCount = 0,
  pulse = false,
  className,
}: NotificationBellProps) {
  return (
    <Link
      to="/citizen/notifications"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors',
        'hover:bg-slate-100 hover:text-slate-700',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        className,
      )}
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white',
            pulse && 'animate-pulse',
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
