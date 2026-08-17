import type { ReactNode } from 'react'
import { MapPin } from 'lucide-react'
import type { Grievance } from '../../contracts/grievance'
import { formatDateTime } from '../../utils/format'
import { Card, CardContent, CardFooter } from '../ui/Card'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

export interface GrievanceCardProps {
  grievance: Grievance
  actions?: ReactNode
  className?: string
}

/** Presentational grievance summary used in list views across portals. */
export function GrievanceCard({ grievance, actions, className }: GrievanceCardProps) {
  return (
    <Card className={className}>
      <CardContent className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-system text-[0.6875rem] font-medium tracking-[0.1em] uppercase text-slate-400">
                {grievance.ticketId}
              </span>
              <StatusBadge status={grievance.status} />
              <PriorityBadge priority={grievance.priority} />
            </div>
            <h3 className="mt-2 font-editorial text-base font-semibold text-ucg-ink">
              {grievance.title}
            </h3>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {grievance.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-system text-[0.6875rem] tracking-[0.06em] text-slate-400">
          {grievance.department && <span className="uppercase">{grievance.department.name}</span>}
          {grievance.assignedOfficer && (
            <span className="uppercase">Officer: {grievance.assignedOfficer.name}</span>
          )}
          {(grievance.location ?? grievance.address) && (
            <span className="inline-flex items-center gap-1 uppercase">
              <MapPin className="size-3.5" aria-hidden="true" />
              {grievance.location ?? grievance.address}
            </span>
          )}
          <span>Submitted {formatDateTime(grievance.createdAt)}</span>
        </div>
      </CardContent>
      {actions && <CardFooter>{actions}</CardFooter>}
    </Card>
  )
}
