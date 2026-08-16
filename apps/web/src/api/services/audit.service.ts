import type { Paginated } from '../../contracts/api'
import type { AuditListParams, AuditLog } from '../../contracts/audit'

/**
 * Audit service interface.
 *
 * MOCK ONLY: audit records are created by the backend
 * (apps/api/src/services/audit.service.ts) but no audit endpoint is exposed.
 * The registry wires this to the mock implementation until a backend endpoint
 * exists.
 */
export interface AuditService {
  list(params?: AuditListParams): Promise<Paginated<AuditLog>>
}
