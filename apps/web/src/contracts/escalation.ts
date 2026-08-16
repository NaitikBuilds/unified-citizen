/**
 * Escalation levels/statuses match the backend enums exactly
 * (source of truth: prisma/schema.prisma `EscalationLevel`, `EscalationStatus`).
 */
export type EscalationLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADMIN'

export type EscalationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED'

export type Escalation = {
  id: string
  grievanceId: string
  level: EscalationLevel
  status: EscalationStatus
  reason: string
  createdById?: string | null
  createdAt: string
  escalatedAt: string
  resolvedAt?: string | null
}

export type EscalationListParams = {
  page?: number
  limit?: number
  status?: EscalationStatus
  level?: EscalationLevel
  grievanceId?: string
  departmentId?: string
  search?: string
}
