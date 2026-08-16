import type { Paginated } from '../../contracts/api'
import type { Sla, SlaListParams } from '../../contracts/sla'

/**
 * SLA service interface.
 *
 * MOCK ONLY: the backend currently creates SLA records internally
 * (apps/api/src/services/sla.service.ts) but exposes no SLA endpoints.
 * The registry wires this to the mock implementation until a backend
 * endpoint exists.
 */
export interface SlaService {
  getByGrievance(grievanceId: string): Promise<Sla | null>
  list(params?: SlaListParams): Promise<Paginated<Sla>>
}
