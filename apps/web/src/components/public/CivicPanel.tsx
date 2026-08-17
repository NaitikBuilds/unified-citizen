import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface CivicPanelProps {
  /** Optional icon chip in the header row. */
  icon?: LucideIcon
  /** Optional serif panel title. */
  title?: string
  /** Optional mono metadata label (header row, right side). */
  meta?: string
  /** Hover lift + border tint. */
  hover?: boolean
  /** Surface tone — 'critical' for high-attention channels (e.g. emergency). */
  tone?: 'default' | 'critical'
  children: ReactNode
  className?: string
}

/**
 * Layered civic surface — the paper panel of the public system. Use instead
 * of ad-hoc card markup; keeps the shared hairline border + controlled shadow.
 */
export function CivicPanel({
  icon: Icon,
  title,
  meta,
  hover,
  tone = 'default',
  children,
  className,
}: CivicPanelProps) {
  return (
    <div
      className={cn(
        'civic-panel',
        hover && 'civic-panel-hover',
        tone === 'critical' && 'civic-panel-critical',
        className,
      )}
    >
      {(Icon || title || meta) && (
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 pt-5 pb-4">
          {Icon && (
            <span className="civic-icon-chip">
              <Icon aria-hidden="true" />
            </span>
          )}
          {title && (
            <h3 className="font-editorial text-lg font-semibold text-ucg-ink">{title}</h3>
          )}
          {meta && <span className="civic-mono-label ml-auto">{meta}</span>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
