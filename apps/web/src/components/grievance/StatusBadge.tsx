import type { GrievanceStatus } from '../../contracts/grievance'
import { Badge } from '../ui/Badge'
import {
  GRIEVANCE_STATUS_LABELS,
  GRIEVANCE_STATUS_VARIANTS,
} from './statusMeta'

export interface StatusBadgeProps {
  status: GrievanceStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={GRIEVANCE_STATUS_VARIANTS[status]} className={className}>
      {GRIEVANCE_STATUS_LABELS[status]}
    </Badge>
  )
}
