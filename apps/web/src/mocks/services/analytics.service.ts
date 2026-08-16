import type {
  AnalyticsParams,
  AnalyticsSummary,
  DepartmentPerformance,
  GeographicPoint,
  MonthlyTrendPoint,
  PriorityDistributionPoint,
  StatusDistributionPoint,
} from '../../contracts/analytics'
import type { AnalyticsService } from '../../api/services/analytics.service'
import {
  mockAnalyticsSummary,
  mockDepartmentPerformance,
  mockGeographicData,
  mockMonthlyTrend,
  mockPriorityDistribution,
  mockStatusDistribution,
} from '../data/analytics'
import { maybeFail, simulateLatency } from './mockUtils'

/**
 * MOCK analytics service. MOCK ONLY — the backend exposes no analytics
 * endpoints.
 */
export const mockAnalyticsService: AnalyticsService = {
  async getSummary(_params?: AnalyticsParams): Promise<AnalyticsSummary> {
    maybeFail('analytics.getSummary')
    await simulateLatency()
    return { ...mockAnalyticsSummary }
  },

  async getStatusDistribution(_params?: AnalyticsParams): Promise<StatusDistributionPoint[]> {
    maybeFail('analytics.getStatusDistribution')
    await simulateLatency()
    return mockStatusDistribution.map((point) => ({ ...point }))
  },

  async getPriorityDistribution(_params?: AnalyticsParams): Promise<PriorityDistributionPoint[]> {
    maybeFail('analytics.getPriorityDistribution')
    await simulateLatency()
    return mockPriorityDistribution.map((point) => ({ ...point }))
  },

  async getDepartmentPerformance(_params?: AnalyticsParams): Promise<DepartmentPerformance[]> {
    maybeFail('analytics.getDepartmentPerformance')
    await simulateLatency()
    return mockDepartmentPerformance.map((item) => ({ ...item }))
  },

  async getMonthlyTrend(_params?: AnalyticsParams): Promise<MonthlyTrendPoint[]> {
    maybeFail('analytics.getMonthlyTrend')
    await simulateLatency()
    return mockMonthlyTrend.map((point) => ({ ...point }))
  },

  async getGeographicData(_params?: AnalyticsParams): Promise<GeographicPoint[]> {
    maybeFail('analytics.getGeographicData')
    await simulateLatency()
    return mockGeographicData.map((point) => ({ ...point }))
  },
}
