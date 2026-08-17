import type { ReactNode } from 'react'
import { Landmark } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { NavItem } from './types'

export interface SidebarProps {
  navItems: NavItem[]
  activeKey?: string
  onSelect: (key: string) => void
  footer?: ReactNode
  className?: string
}

/**
 * Desktop sidebar: product brand header, signal-treated active nav item
 * (background + edge indicator + icon emphasis — never color alone), thin
 * civic scrollbar, and the footer (sign-out) area.
 */
export function Sidebar({ navItems, activeKey, onSelect, footer, className }: SidebarProps) {
  return (
    <aside className={cn('portal-sidebar', className)}>
      <div className="portal-sidebar-brand">
        <span className="ucg-logo-mark">
          <Landmark className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="ucg-wordmark">Unified Citizen</p>
          <p className="portal-system-label mt-0.5">Operations console</p>
        </div>
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
                  onClick={() => onSelect(item.key)}
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

      {footer && <div className="border-t border-slate-200 p-3">{footer}</div>}
    </aside>
  )
}
