import type { Paginated } from '../../contracts/api'
import type { Escalation, EscalationListParams } from '../../contracts/escalation'
import type { EscalationService } from '../services/escalation.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface EscalationsResponse {
  escalations: Escalation[]
}

/**
 * REAL API escalation adapter. Backend wire shapes
 * (apps/api/src/controllers/escalation.controller.ts):
 *
 *   GET /escalations/:grievanceId → { escalations: Escalation[] }
 *   GET /escalations              → { escalations: Escalation[] }
 *
 * Scoping is enforced server-side from the authenticated session — the
 * adapter intentionally does not send a client-supplied departmentId.
 */
export const apiEscalationService: EscalationService = {
  async getByGrievance(grievanceId: string): Promise<Escalation[]> {
    const { data } = await client.get<EscalationsResponse>(`/escalations/${grievanceId}`)
    return data.escalations
  },

  async list(params: EscalationListParams = {}): Promise<Paginated<Escalation>> {
    const { data } = await client.get<EscalationsResponse>('/escalations', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    })
    return toPaginated(data.escalations, params.page ?? 1, params.limit ?? 10)
  },
}
