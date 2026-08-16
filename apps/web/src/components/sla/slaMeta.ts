import type { SlaStatus } from '../../contracts/sla'
import type { BadgeVariant } from '../ui/Badge'

export const SLA_STATUS_LABELS: Record<SlaStatus, string> = {
  ACTIVE: 'On Track',
  WARNING: 'At Risk',
  BREACHED: 'Breached',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
}

export const SLA_STATUS_VARIANTS: Record<SlaStatus, BadgeVariant> = {
  ACTIVE: 'success',
  WARNING: 'warning',
  BREACHED: 'danger',
  COMPLETED: 'neutral',
  PAUSED: 'neutral',
}

/** Remaining hours until a deadline (negative = overdue). */
export function hoursRemaining(deadline: string): number {
  return (new Date(deadline).getTime() - Date.now()) / 3_600_000
}
