import type { OfficerSummary } from './department'

/**
 * Grievance statuses match the backend enum exactly
 * (source of truth: prisma/schema.prisma `GrievanceStatus`).
 */
export type GrievanceStatus =
  | 'SUBMITTED'
  | 'AI_CLASSIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED'
  | 'REOPENED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type GrievanceCitizen = {
  id: string
  name: string
  email?: string
}

export type GrievanceDepartment = {
  id: string
  name: string
}

/**
 * Domain grievance contract. Mirrors the backend `Grievance` model plus the
 * relations the API includes (`citizen`, `department`). `assignedOfficer` is
 * a frontend convenience populated from assignment data — the current backend
 * does not return the active assignment with the grievance payload.
 */
export type Grievance = {
  id: string
  ticketId: string
  title: string
  description: string
  status: GrievanceStatus
  priority: Priority
  category?: string
  subcategory?: string
  departmentId?: string | null
  department?: GrievanceDepartment | null
  citizenId?: string
  citizen?: GrievanceCitizen | null
  assignedOfficer?: OfficerSummary | null
  location?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt?: string | null
  resolvedAt?: string | null
}

/**
 * Citizen-submitted grievance. The backend derives the citizen from the
 * authenticated session — never send a citizenId.
 *
 * Note (integration): the backend create route persists `address` but not
 * `location`; adapters map `location` to `address`.
 */
export type CreateGrievanceRequest = {
  title: string
  description: string
  category: string
  priority?: Priority
  departmentId?: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
}

export type UpdateGrievanceRequest = {
  title?: string
  description?: string
  category?: string
  departmentId?: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
}

export type UpdateGrievanceStatusRequest = {
  status: GrievanceStatus
  comment?: string
}

export type AssignGrievanceRequest = {
  officerId: string
  departmentId?: string
  reason?: string
}

export type EscalateGrievanceRequest = {
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADMIN'
  reason: string
}

export type GrievanceSortField = 'createdAt' | 'updatedAt' | 'priority' | 'status'

export type SortDirection = 'asc' | 'desc'

export type GrievanceListParams = {
  page?: number
  limit?: number
  search?: string
  status?: GrievanceStatus
  /** Multiple statuses (OR). Supersedes `status` when both are present. */
  statuses?: GrievanceStatus[]
  priority?: Priority
  category?: string
  departmentId?: string
  officerId?: string
  from?: string
  to?: string
  sortBy?: GrievanceSortField
  sortDir?: SortDirection
}
