import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { NavItem } from './types'

export interface MobileNavProps {
  open: boolean
  navItems: NavItem[]
  activeKey?: string
  onSelect: (key: string) => void
  onClose: () => void
  footer?: ReactNode
}

export function MobileNav({
  open,
  navItems,
  activeKey,
  onSelect,
  onClose,
  footer,
}: MobileNavProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      className={cn('fixed inset-0 z-40 lg:hidden', open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = item.key === activeKey
              const Icon = item.icon
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.key)
                      onClose()
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    {Icon && <Icon className="size-4.5 shrink-0" aria-hidden="true" />}
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        {footer && <div className="border-t border-slate-200 p-3">{footer}</div>}
      </div>
    </div>
  )
}
