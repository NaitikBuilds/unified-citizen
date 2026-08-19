import type { Paginated } from '../../contracts/api'
import type { AuditListParams, AuditLog } from '../../contracts/audit'
import type { AuditService } from '../services/audit.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface AuditLogsResponse {
  auditLogs: AuditLog[]
}

/**
 * REAL API audit adapter. Backend wire shapes
 * (apps/api/src/controllers/audit.controller.ts):
 *
 *   GET /audit-logs/:grievanceId → { auditLogs: AuditLog[] }
 *   GET /audit-logs              → { auditLogs: AuditLog[] }
 *
 * The collection endpoint returns a plain array (matching the escalation/SLA
 * contract). Frontend wraps in Paginated<T> via toPaginated().
 *
 * Scoping is enforced server-side from the authenticated session — the
 * adapter intentionally does not send a client-supplied departmentId.
 */
export const apiAuditService: AuditService = {
  async getByGrievance(grievanceId: string): Promise<AuditLog[]> {
    const { data } = await client.get<AuditLogsResponse>(`/audit-logs/${grievanceId}`)
    return data.auditLogs
  },

  async list(params: AuditListParams = {}): Promise<Paginated<AuditLog>> {
    const { data } = await client.get<AuditLogsResponse>('/audit-logs', {
      params: {
        action: params.action,
        grievanceId: params.grievanceId,
      },
    })
    return toPaginated(data.auditLogs, params.page ?? 1, params.limit ?? 10)
  },
}
