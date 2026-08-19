import type { Paginated } from '../../contracts/api'
import type { AuditListParams, AuditLog } from '../../contracts/audit'

/**
 * Audit service interface.
 *
 * Provides both collection (scoped by role) and per-grievance reads.
 * The registry wires this to the mock or real API adapter based on
 * `config.useMockApi`.
 */
export interface AuditService {
  list(params?: AuditListParams): Promise<Paginated<AuditLog>>
  getByGrievance(grievanceId: string): Promise<AuditLog[]>
}
