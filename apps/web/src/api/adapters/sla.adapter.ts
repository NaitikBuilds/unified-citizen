import type { Paginated } from '../../contracts/api'
import type { Sla, SlaListParams } from '../../contracts/sla'
import type { SlaService } from '../services/sla.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface SlaResponse {
  sla: Sla | null
}

interface SlasResponse {
  slas: Sla[]
}

/**
 * REAL API SLA adapter. Backend wire shapes (apps/api/src/controllers/sla.controller.ts):
 *
 *   GET /slas/:grievanceId → { sla: Sla | null }  (null when no SLA yet)
 *   GET /slas              → { slas: Sla[] }       (server-scoped by token)
 *
 * Scoping is enforced server-side from the authenticated session — the
 * adapter intentionally does not send a client-supplied departmentId.
 */
export const apiSlaService: SlaService = {
  async getByGrievance(grievanceId: string): Promise<Sla | null> {
    const { data } = await client.get<SlaResponse>(`/slas/${grievanceId}`)
    return data.sla
  },

  async list(params: SlaListParams = {}): Promise<Paginated<Sla>> {
    const { data } = await client.get<SlasResponse>('/slas', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    })
    return toPaginated(data.slas, params.page ?? 1, params.limit ?? 10)
  },
}
