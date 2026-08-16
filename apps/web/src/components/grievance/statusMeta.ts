import type { GrievanceStatus } from '../../contracts/grievance'
import type { BadgeVariant } from '../ui/Badge'

export const GRIEVANCE_STATUS_LABELS: Record<GrievanceStatus, string> = {
  SUBMITTED: 'Submitted',
  AI_CLASSIFIED: 'AI Classified',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  REOPENED: 'Reopened',
}

export const GRIEVANCE_STATUS_VARIANTS: Record<GrievanceStatus, BadgeVariant> = {
  SUBMITTED: 'neutral',
  AI_CLASSIFIED: 'info',
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  ESCALATED: 'danger',
  RESOLVED: 'success',
  REJECTED: 'danger',
  REOPENED: 'warning',
}
