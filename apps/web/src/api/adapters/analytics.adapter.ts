import type {
  AnalyticsParams,
  AnalyticsSummary,
  DepartmentPerformance,
  GeographicPoint,
  MonthlyTrendPoint,
  PriorityDistributionPoint,
  StatusDistributionPoint,
} from '../../contracts/analytics'
import type { AnalyticsService } from '../services/analytics.service'
import { client } from '../client'

interface SummaryResponse {
  summary: AnalyticsSummary
}

interface StatusDistributionResponse {
  statusDistribution: StatusDistributionPoint[]
}

interface PriorityDistributionResponse {
  priorityDistribution: PriorityDistributionPoint[]
}

interface DepartmentPerformanceResponse {
  departmentPerformance: DepartmentPerformance[]
}

interface MonthlyTrendResponse {
  monthlyTrend: MonthlyTrendPoint[]
}

interface GeographicDataResponse {
  geographicData: GeographicPoint[]
}

/**
 * REAL API analytics adapter. Maps backend wire responses to domain contracts.
 */
export const apiAnalyticsService: AnalyticsService = {
  async getSummary(params?: AnalyticsParams): Promise<AnalyticsSummary> {
    const { data } = await client.get<SummaryResponse>('/analytics/summary', {
      params,
    })
    return data.summary
  },

  async getStatusDistribution(params?: AnalyticsParams): Promise<StatusDistributionPoint[]> {
    const { data } = await client.get<StatusDistributionResponse>(
      '/analytics/status-distribution',
      { params },
    )
    return data.statusDistribution
  },

  async getPriorityDistribution(params?: AnalyticsParams): Promise<PriorityDistributionPoint[]> {
    const { data } = await client.get<PriorityDistributionResponse>(
      '/analytics/priority-distribution',
      { params },
    )
    return data.priorityDistribution
  },

  async getDepartmentPerformance(params?: AnalyticsParams): Promise<DepartmentPerformance[]> {
    const { data } = await client.get<DepartmentPerformanceResponse>(
      '/analytics/department-performance',
      { params },
    )
    return data.departmentPerformance
  },

  async getMonthlyTrend(params?: AnalyticsParams): Promise<MonthlyTrendPoint[]> {
    const { data } = await client.get<MonthlyTrendResponse>(
      '/analytics/monthly-trend',
      { params },
    )
    return data.monthlyTrend
  },

  async getGeographicData(params?: AnalyticsParams): Promise<GeographicPoint[]> {
    const { data } = await client.get<GeographicDataResponse>(
      '/analytics/geographic-data',
      { params },
    )
    return data.geographicData
  },
}
