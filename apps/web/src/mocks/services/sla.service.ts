import type { Paginated } from '../../contracts/api'
import type { Sla, SlaListParams } from '../../contracts/sla'
import type { SlaService } from '../../api/services/sla.service'
import { mockSlaRecords } from '../data/sla'
import { matchesSearch, maybeFail, paginate, simulateLatency } from './mockUtils'

/**
 * MOCK SLA service. MOCK ONLY — the backend exposes no SLA endpoints.
 */
export const mockSlaService: SlaService = {
  async getByGrievance(grievanceId: string): Promise<Sla | null> {
    maybeFail('sla.getByGrievance')
    await simulateLatency(100, 300)

    const sla = mockSlaRecords.find((item) => item.grievanceId === grievanceId)
    return sla ? { ...sla } : null
  },

  async list(params: SlaListParams = {}): Promise<Paginated<Sla>> {
    maybeFail('sla.list')
    await simulateLatency()

    let results = [...mockSlaRecords]

    if (params.status) {
      results = results.filter((item) => item.status === params.status)
    }
    if (params.departmentId) {
      results = results.filter((item) => item.departmentId === params.departmentId)
    }
    if (params.search) {
      results = results.filter((item) =>
        matchesSearch(item, params.search, ['grievanceId']),
      )
    }

    return paginate(results.map((item) => ({ ...item })), params.page ?? 1, params.limit ?? 10)
  },
}
