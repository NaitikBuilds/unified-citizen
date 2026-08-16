import type { Priority } from '../../contracts/grievance'
import type { BadgeVariant } from '../ui/Badge'

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const PRIORITY_VARIANTS: Record<Priority, BadgeVariant> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
}
