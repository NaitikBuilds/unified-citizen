import type { Paginated } from '../../contracts/api'
import type { AuditListParams, AuditLog } from '../../contracts/audit'
import type { AuditService } from '../../api/services/audit.service'
import { mockAuditLogs } from '../data/audit'
import { matchesSearch, maybeFail, paginate, simulateLatency } from './mockUtils'

/**
 * MOCK audit service. MOCK ONLY — the backend exposes no audit endpoints.
 */
export const mockAuditService: AuditService = {
  async list(params: AuditListParams = {}): Promise<Paginated<AuditLog>> {
    maybeFail('audit.list')
    await simulateLatency()

    let results = [...mockAuditLogs]

    if (params.action) {
      results = results.filter((item) => item.action === params.action)
    }
    if (params.grievanceId) {
      results = results.filter((item) => item.grievanceId === params.grievanceId)
    }
    if (params.userId) {
      results = results.filter((item) => item.userId === params.userId)
    }
    if (params.search) {
      results = results.filter(
        (item) =>
          matchesSearch(item, params.search, ['action']) ||
          item.user?.name.toLowerCase().includes((params.search ?? '').toLowerCase()) ||
          item.grievance?.ticketId.toLowerCase().includes((params.search ?? '').toLowerCase()),
      )
    }

    return paginate(results.map((item) => ({ ...item })), params.page ?? 1, params.limit ?? 10)
  },
}
