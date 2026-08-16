/**
 * Audit actions observed in the backend (`apps/api/src/services/audit.service.ts`
 * and controllers). The contract stays open (`action: string`) because the
 * backend does not constrain the action values.
 */
export type AuditAction =
  | 'CREATE_GRIEVANCE'
  | 'UPDATE_GRIEVANCE'
  | 'UPDATE_STATUS'
  | 'DELETE_GRIEVANCE'
  | 'ASSIGN_GRIEVANCE'
  | 'COMMENT_ADDED'
  | 'ATTACHMENT_ADDED'
  | 'FEEDBACK_SUBMITTED'
  | 'ESCALATE_GRIEVANCE'
  | 'REOPEN_GRIEVANCE'

export type AuditLog = {
  id: string
  userId?: string | null
  user?: { id: string; name: string } | null
  grievanceId?: string | null
  grievance?: { id: string; ticketId: string; title: string } | null
  action: string
  oldValue?: unknown
  newValue?: unknown
  metadata?: unknown
  createdAt: string
}

export type AuditListParams = {
  page?: number
  limit?: number
  action?: string
  grievanceId?: string
  userId?: string
  search?: string
}
