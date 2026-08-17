import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'

export interface TopbarProps {
  title?: string
  onMenuClick?: () => void
  right?: ReactNode
}

/**
 * Portal topbar: sticky translucent surface, mono system label above the
 * serif page title, mobile menu trigger on small screens, actions on the
 * right (notification bell, user chip, sign out).
 */
export function Topbar({ title, onMenuClick, right }: TopbarProps) {
  return (
    <header className="portal-topbar">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="portal-menu-btn lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}
        {title && (
          <div className="min-w-0">
            <p className="portal-system-label">{title.toUpperCase()}</p>
            <h1 className="portal-title truncate">{title}</h1>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">{right}</div>
      </div>
    </header>
  )
}
