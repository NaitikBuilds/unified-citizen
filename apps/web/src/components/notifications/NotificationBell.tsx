import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { services } from '../../api/registry'
import { cn } from '../../utils/cn'
import { NOTIFICATIONS_CHANGED_EVENT } from './events'

export interface NotificationBellProps {
  className?: string
}

/**
 * Topbar entry point to the notification center (Steps 86 + 94). Fetches the
 * unread count from the notification service, refreshes when the
 * notifications page mutates state (NOTIFICATIONS_CHANGED_EVENT) or the
 * window regains focus, and shows a brief pulse when the unread count rises.
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const previousCountRef = useRef(0)
  const pulseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function refresh(): Promise<void> {
      try {
        const result = await services.notification.list({ unreadOnly: true, limit: 100 })
        if (cancelled) {
          return
        }
        const count = result.total
        setUnreadCount(count)
        if (count > previousCountRef.current) {
          setPulse(true)
          if (pulseTimerRef.current !== null) {
            window.clearTimeout(pulseTimerRef.current)
          }
          pulseTimerRef.current = window.setTimeout(() => {
            setPulse(false)
            pulseTimerRef.current = null
          }, 3000)
        }
        previousCountRef.current = count
      } catch {
        // The bell degrades gracefully — no count, still navigable.
      }
    }

    void refresh()

    const handleChange = (): void => {
      void refresh()
    }
    const handleFocus = (): void => {
      void refresh()
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChange)
      window.removeEventListener('focus', handleFocus)
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current)
      }
    }
  }, [])

  return (
    <Link
      to="/citizen/notifications"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors',
        'hover:bg-ucg-fog hover:text-ucg-ink',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ucg-blue',
        className,
      )}
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white',
            pulse && 'animate-pulse motion-reduce:animate-none',
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
