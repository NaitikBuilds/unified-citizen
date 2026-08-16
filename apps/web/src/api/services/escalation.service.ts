import type { Paginated } from '../../contracts/api'
import type {
  Escalation,
  EscalationListParams,
} from '../../contracts/escalation'

/**
 * Escalation service interface.
 *
 * MOCK ONLY: the backend escalation flow exists (`POST /grievances/:id/escalate`)
 * but there is no endpoint to list escalations. The registry wires this to the
 * mock implementation until a backend endpoint exists.
 */
export interface EscalationService {
  list(params?: EscalationListParams): Promise<Paginated<Escalation>>
  getByGrievance(grievanceId: string): Promise<Escalation[]>
}
