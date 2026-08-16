import type { Paginated } from '../../contracts/api'
import type {
  Escalation,
  EscalationListParams,
} from '../../contracts/escalation'
import type { EscalationService } from '../../api/services/escalation.service'
import { mockEscalations } from '../data/escalations'
import { matchesSearch, maybeFail, paginate, simulateLatency } from './mockUtils'

/**
 * MOCK escalation service. MOCK ONLY — the backend exposes no escalation
 * list endpoints.
 */
export const mockEscalationService: EscalationService = {
  async list(params: EscalationListParams = {}): Promise<Paginated<Escalation>> {
    maybeFail('escalation.list')
    await simulateLatency()

    let results = [...mockEscalations]

    if (params.status) {
      results = results.filter((item) => item.status === params.status)
    }
    if (params.level) {
      results = results.filter((item) => item.level === params.level)
    }
    if (params.grievanceId) {
      results = results.filter((item) => item.grievanceId === params.grievanceId)
    }
    if (params.search) {
      results = results.filter((item) =>
        matchesSearch(item, params.search, ['grievanceId', 'reason']),
      )
    }

    return paginate(results.map((item) => ({ ...item })), params.page ?? 1, params.limit ?? 10)
  },

  async getByGrievance(grievanceId: string): Promise<Escalation[]> {
    maybeFail('escalation.getByGrievance')
    await simulateLatency(100, 300)
    return mockEscalations
      .filter((item) => item.grievanceId === grievanceId)
      .map((item) => ({ ...item }))
  },
}
