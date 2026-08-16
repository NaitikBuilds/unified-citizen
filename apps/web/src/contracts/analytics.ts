import type { GrievanceStatus, Priority } from './grievance'

export type AnalyticsSummary = {
  total: number
  submitted: number
  aiClassified: number
  assigned: number
  inProgress: number
  escalated: number
  resolved: number
  reopened: number
  rejected: number
  /** submitted + aiClassified — grievances awaiting staff action. */
  pending: number
  avgResolutionHours?: number
  slaComplianceRate?: number
  satisfactionScore?: number
}

export type StatusDistributionPoint = {
  status: GrievanceStatus
  count: number
}

export type PriorityDistributionPoint = {
  priority: Priority
  count: number
}

export type DepartmentPerformance = {
  departmentId: string
  departmentName: string
  total: number
  resolved: number
  open: number
  escalated: number
  slaComplianceRate?: number
  avgResolutionHours?: number
}

export type MonthlyTrendPoint = {
  /** ISO month label, e.g. "2026-01". */
  month: string
  created: number
  resolved: number
}

export type GeographicPoint = {
  label: string
  count: number
  latitude?: number
  longitude?: number
}

export type AnalyticsParams = {
  departmentId?: string
  from?: string
  to?: string
}
