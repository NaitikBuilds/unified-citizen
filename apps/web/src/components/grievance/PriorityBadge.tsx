import type { Priority } from '../../contracts/grievance'
import { Badge } from '../ui/Badge'
import { PRIORITY_LABELS, PRIORITY_VARIANTS } from './priorityMeta'

export interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant={PRIORITY_VARIANTS[priority]} className={className}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
