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
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-slate-400" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700">SLA</span>
        </div>
        <Badge variant={SLA_STATUS_VARIANTS[sla.status]}>
          {SLA_STATUS_LABELS[sla.status]}
        </Badge>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Response due</dt>
          <dd className="font-medium text-slate-800">
            {formatDateTime(sla.responseDueAt)}
          </dd>
        </div>
        {showResolution && (
          <div>
            <dt className="text-xs text-slate-500">Resolution due</dt>
            <dd className="font-medium text-slate-800">
              {formatDateTime(sla.resolutionDueAt)}
            </dd>
          </div>
        )}
      </dl>

      {sla.status === 'ACTIVE' || sla.status === 'WARNING' ? (
        <p
          className={cn(
            'mt-2 text-xs font-medium',
            hoursLeft < 24 ? 'text-red-600' : 'text-slate-500',
          )}
        >
          {hoursLeft >= 0
            ? `${formatHours(hoursLeft)} remaining`
            : `Overdue by ${formatHours(Math.abs(hoursLeft))}`}
        </p>
      ) : breached && sla.breachedAt ? (
        <p className="mt-2 text-xs font-medium text-red-600">
          Breached at {formatDateTime(sla.breachedAt)}
        </p>
      ) : null}
    </div>
  )
}
