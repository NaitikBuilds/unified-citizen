import type { Paginated } from '../../contracts/api'
import type { Sla, SlaListParams } from '../../contracts/sla'

/**
 * SLA service interface.
 *
 * Real API (V6.0a): GET /api/v1/slas and GET /api/v1/slas/:grievanceId,
 * implemented in adapters/sla.adapter.ts and scoped server-side by token.
 * Mock mode remains available for standalone development.
 */
export interface SlaService {
  getByGrievance(grievanceId: string): Promise<Sla | null>
  list(params?: SlaListParams): Promise<Paginated<Sla>>
}
