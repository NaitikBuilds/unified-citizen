import { useId, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface TabItem {
  value: string
  label: string
  icon?: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Accessible tab list (role="tablist"). The parent renders the active panel
 * based on `value`; this component only renders the tab strip.
 */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  const id = useId()

  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={cn('flex flex-wrap gap-1 border-b border-slate-200', className)}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            id={`${id}-tab-${item.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${id}-panel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              selected
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export interface TabPanelProps {
  id?: string
  labelledBy?: string
  active?: boolean
  children: ReactNode
  className?: string
}

export function TabPanel({ active = true, children, className, ...rest }: TabPanelProps) {
  if (!active) {
    return null
  }
  return (
    <div role="tabpanel" className={cn('pt-4', className)} {...rest}>
      {children}
    </div>
  )
}
