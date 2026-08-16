import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'

export interface TopbarProps {
  title?: string
  onMenuClick?: () => void
  right?: ReactNode
}

export function Topbar({ title, onMenuClick, right }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}
        {title && (
          <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
        )}
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
    </header>
  )
}
