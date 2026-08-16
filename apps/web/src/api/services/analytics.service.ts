import type {
  AnalyticsParams,
  AnalyticsSummary,
  DepartmentPerformance,
  GeographicPoint,
  MonthlyTrendPoint,
  PriorityDistributionPoint,
  StatusDistributionPoint,
} from '../../contracts/analytics'

/**
 * Analytics service interface.
 *
 * MOCK ONLY: the backend has no analytics endpoints. The registry wires this
 * to the mock implementation until a backend endpoint exists.
 */
export interface AnalyticsService {
  getSummary(params?: AnalyticsParams): Promise<AnalyticsSummary>
  getStatusDistribution(params?: AnalyticsParams): Promise<StatusDistributionPoint[]>
  getPriorityDistribution(params?: AnalyticsParams): Promise<PriorityDistributionPoint[]>
  getDepartmentPerformance(params?: AnalyticsParams): Promise<DepartmentPerformance[]>
  getMonthlyTrend(params?: AnalyticsParams): Promise<MonthlyTrendPoint[]>
  getGeographicData(params?: AnalyticsParams): Promise<GeographicPoint[]>
}
