import type { OfficerSummary } from './department'

export type GrievanceStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED'
  | 'REOPENED'

export type Priority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type Grievance = {
  id: string
  title: string
  description: string
  status: GrievanceStatus
  priority: Priority
  category?: string
  department?: {
    id: string
    name: string
  }
  assignedOfficer?: OfficerSummary
  location?: string
  createdAt: string
  updatedAt?: string
}