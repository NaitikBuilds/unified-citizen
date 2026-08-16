import type { Priority } from './grievance'

/**
 * SLA statuses match the backend enum exactly
 * (source of truth: prisma/schema.prisma `SLAStatus`).
 */
export type SlaStatus = 'ACTIVE' | 'WARNING' | 'BREACHED' | 'COMPLETED' | 'PAUSED'

export type Sla = {
  id: string
  grievanceId: string
  policyId?: string | null
  departmentId: string
  responseTimeHours: number
  resolutionTimeHours: number
  responseDueAt: string
  resolutionDueAt: string
  status: SlaStatus
  responseCompletedAt?: string | null
  resolutionCompletedAt?: string | null
  breachedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export type SlaPolicy = {
  id: string
  name: string
  description?: string | null
  departmentId: string
  category?: string | null
  priority?: Priority | null
  responseTimeHours: number
  resolutionTimeHours: number
  isActive: boolean
}

export type SlaListParams = {
  page?: number
  limit?: number
  status?: SlaStatus
  departmentId?: string
  search?: string
}
