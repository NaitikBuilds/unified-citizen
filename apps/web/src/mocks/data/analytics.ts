import type {
  AnalyticsSummary,
  DepartmentPerformance,
  GeographicPoint,
  MonthlyTrendPoint,
  PriorityDistributionPoint,
  StatusDistributionPoint,
} from '../../contracts/analytics'

export const mockAnalyticsSummary: AnalyticsSummary = {
  total: 18,
  submitted: 3,
  aiClassified: 2,
  assigned: 2,
  inProgress: 3,
  escalated: 3,
  resolved: 4,
  reopened: 1,
  rejected: 1,
  pending: 5,
  avgResolutionHours: 86,
  slaComplianceRate: 0.71,
  satisfactionScore: 3.9,
}

export const mockStatusDistribution: StatusDistributionPoint[] = [
  { status: 'SUBMITTED', count: 3 },
  { status: 'AI_CLASSIFIED', count: 2 },
  { status: 'ASSIGNED', count: 2 },
  { status: 'IN_PROGRESS', count: 3 },
  { status: 'ESCALATED', count: 3 },
  { status: 'RESOLVED', count: 4 },
  { status: 'REJECTED', count: 1 },
  { status: 'REOPENED', count: 1 },
]

export const mockPriorityDistribution: PriorityDistributionPoint[] = [
  { priority: 'LOW', count: 5 },
  { priority: 'MEDIUM', count: 7 },
  { priority: 'HIGH', count: 4 },
  { priority: 'CRITICAL', count: 3 },
]

export const mockDepartmentPerformance: DepartmentPerformance[] = [
  {
    departmentId: 'dept-pwd',
    departmentName: 'Public Works Department',
    total: 5,
    resolved: 2,
    open: 3,
    escalated: 1,
    slaComplianceRate: 0.62,
    avgResolutionHours: 94,
  },
  {
    departmentId: 'dept-sanitation',
    departmentName: 'Sanitation Department',
    total: 4,
    resolved: 2,
    open: 2,
    escalated: 1,
    slaComplianceRate: 0.68,
    avgResolutionHours: 71,
  },
  {
    departmentId: 'dept-water',
    departmentName: 'Water Department',
    total: 3,
    resolved: 1,
    open: 2,
    escalated: 1,
    slaComplianceRate: 0.58,
    avgResolutionHours: 88,
  },
  {
    departmentId: 'dept-electricity',
    departmentName: 'Electricity Department',
    total: 2,
    resolved: 0,
    open: 2,
    escalated: 0,
    slaComplianceRate: 0.75,
    avgResolutionHours: 60,
  },
  {
    departmentId: 'dept-health',
    departmentName: 'Health Department',
    total: 2,
    resolved: 0,
    open: 2,
    escalated: 0,
    slaComplianceRate: 0.8,
    avgResolutionHours: 55,
  },
  {
    departmentId: 'dept-transport',
    departmentName: 'Transport Department',
    total: 2,
    resolved: 0,
    open: 2,
    escalated: 0,
    slaComplianceRate: 0.85,
    avgResolutionHours: 42,
  },
]

export const mockMonthlyTrend: MonthlyTrendPoint[] = [
  { month: '2026-03', created: 8, resolved: 5 },
  { month: '2026-04', created: 12, resolved: 8 },
  { month: '2026-05', created: 10, resolved: 11 },
  { month: '2026-06', created: 14, resolved: 9 },
  { month: '2026-07', created: 16, resolved: 13 },
  { month: '2026-08', created: 18, resolved: 10 },
]

export const mockGeographicData: GeographicPoint[] = [
  { label: 'Ward 1 — Railway Colony', count: 14, latitude: 28.6042, longitude: 77.2086 },
  { label: 'Ward 2 — Hospital Zone', count: 9, latitude: 28.6289, longitude: 77.2018 },
  { label: 'Ward 3 — Ashok Nagar', count: 17, latitude: 28.6267, longitude: 77.2055 },
  { label: 'Ward 4 — City Park', count: 11, latitude: 28.6098, longitude: 77.2155 },
  { label: 'Ward 5 — Market Lane', count: 21, latitude: 28.6104, longitude: 77.2183 },
  { label: 'Ward 6 — Central Park', count: 13, latitude: 28.6201, longitude: 77.2011 },
  { label: 'Ward 7 — Lake View', count: 19, latitude: 28.6412, longitude: 77.1945 },
  { label: 'Ward 8 — Temple Road', count: 8, latitude: 28.6273, longitude: 77.2079 },
  { label: 'Ward 9 — Nehru Street', count: 24, latitude: 28.6225, longitude: 77.2319 },
  { label: 'Ward 10 — Green Valley', count: 16, latitude: 28.6334, longitude: 77.2239 },
]
