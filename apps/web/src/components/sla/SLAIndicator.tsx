import { Clock } from 'lucide-react'
import type { Sla } from '../../contracts/sla'
import { formatDateTime, formatHours } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import {
  hoursRemaining,
  SLA_STATUS_LABELS,
  SLA_STATUS_VARIANTS,
} from './slaMeta'

export interface SLAIndicatorProps {
  sla: Sla
  showResolution?: boolean
  className?: string
}

export function SLAIndicator({
  sla,
  showResolution = true,
  className,
}: SLAIndicatorProps) {
  const hoursLeft = hoursRemaining(sla.resolutionDueAt)
  const breached = sla.status === 'BREACHED'

  return (
    <div className={cn('rounded-xl border border-ucg-fog bg-white p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ucg-blue/8 text-ucg-blue">
            <Clock className="size-4" aria-hidden="true" />
          </span>
          <span className="font-system text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-600">
            SLA
          </span>
        </div>
        <Badge variant={SLA_STATUS_VARIANTS[sla.status]}>
          {SLA_STATUS_LABELS[sla.status]}
        </Badge>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-system text-[0.625rem] uppercase tracking-[0.12em] text-slate-500">
            Response due
          </dt>
          <dd className="mt-0.5 font-medium text-ucg-ink">
            {formatDateTime(sla.responseDueAt)}
          </dd>
        </div>
        {showResolution && (
          <div>
            <dt className="font-system text-[0.625rem] uppercase tracking-[0.12em] text-slate-500">
              Resolution due
            </dt>
            <dd className="mt-0.5 font-medium text-ucg-ink">
              {formatDateTime(sla.resolutionDueAt)}
            </dd>
          </div>
        )}
      </dl>

      {sla.status === 'ACTIVE' || sla.status === 'WARNING' ? (
        <p
          className={cn(
            'mt-2 font-system text-[0.6875rem] uppercase tracking-[0.08em]',
            hoursLeft < 24 ? 'font-semibold text-ucg-critical' : 'text-slate-500',
          )}
        >
          {hoursLeft >= 0
            ? `${formatHours(hoursLeft)} remaining`
            : `Overdue by ${formatHours(Math.abs(hoursLeft))}`}
        </p>
      ) : breached && sla.breachedAt ? (
        <p className="mt-2 font-system text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ucg-critical">
          Breached at {formatDateTime(sla.breachedAt)}
        </p>
      ) : null}
    </div>
  )
}
