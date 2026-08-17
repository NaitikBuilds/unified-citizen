import { useEffect, useRef, type ReactNode } from 'react'
import { Landmark, X } from 'lucide-react'
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

/**
 * Mobile drawer for the portal shell. Behavior preserved: Escape closes,
 * overlay click closes, body scroll locks while open, navigation selects and
 * closes, dialog semantics with inert-when-closed and focus moved into the
 * panel. Visuals follow the civic portal language.
 */
export function MobileNav({
  open,
  navItems,
  activeKey,
  onSelect,
  onClose,
  footer,
}: MobileNavProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

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
      inert={!open}
    >
      <div
        className={cn(
          'portal-mobile-overlay',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'portal-mobile-drawer',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="portal-drawer-brand">
          <span className="flex min-w-0 items-center gap-2">
            <span className="ucg-logo-mark">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="ucg-wordmark block">Unified Citizen</span>
              <span className="portal-system-label mt-0.5 block">Operations console</span>
            </span>
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="portal-menu-btn"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary" className="portal-scroll flex-1 overflow-y-auto px-3 py-4">
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
                    className={cn('portal-nav-item', active && 'portal-nav-item-active')}
                  >
                    {Icon && <Icon className="size-4.5 shrink-0" aria-hidden="true" />}
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        {footer && <div className="border-t border-ucg-fog p-3">{footer}</div>}
      </div>
    </div>
  )
}
