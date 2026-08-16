import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import type { NavItem } from './types'

export interface SidebarProps {
  navItems: NavItem[]
  activeKey?: string
  onSelect: (key: string) => void
  footer?: ReactNode
  className?: string
}

export function Sidebar({ navItems, activeKey, onSelect, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex',
        className,
      )}
    >
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
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
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
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
    </aside>
  )
}
