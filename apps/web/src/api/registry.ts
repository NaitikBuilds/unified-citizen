import { config } from '../config'
import type { AuthService } from './services/auth.service'
import type { UserService } from './services/user.service'
import type { DepartmentService } from './services/department.service'
import type { GrievanceService } from './services/grievance.service'
import type { NotificationService } from './services/notification.service'
import type { SlaService } from './services/sla.service'
import type { EscalationService } from './services/escalation.service'
import type { AnalyticsService } from './services/analytics.service'
import type { AuditService } from './services/audit.service'
import type { AiService } from './services/ai.service'

import { apiAuthService } from './adapters/auth.adapter'
import { apiUserService } from './adapters/user.adapter'
import { apiDepartmentService } from './adapters/department.adapter'
import { apiGrievanceService } from './adapters/grievance.adapter'
import { apiNotificationService } from './adapters/notification.adapter'
import { apiSlaService } from './adapters/sla.adapter'
import { apiEscalationService } from './adapters/escalation.adapter'
import { apiAuditService } from './adapters/audit.adapter'
import { apiAiService } from './adapters/ai.adapter'

import { mockAuthService } from '../mocks/services/auth.service'
import { mockUserService } from '../mocks/services/user.service'
import { mockDepartmentService } from '../mocks/services/department.service'
import { mockGrievanceService } from '../mocks/services/grievance.service'
import { mockNotificationService } from '../mocks/services/notification.service'
import { mockSlaService } from '../mocks/services/sla.service'
import { mockEscalationService } from '../mocks/services/escalation.service'
import { mockAnalyticsService } from '../mocks/services/analytics.service'
import { mockAuditService } from '../mocks/services/audit.service'
import { mockAiService } from '../mocks/services/ai.service'

/**
 * Central service registry. Every domain service is resolved here once,
 * driven by the environment switch:
 *
 *   VITE_USE_MOCK_API=true  → mock services (MOCK)
 *   VITE_USE_MOCK_API=false → real API adapters (REAL API)
 *
 * Components must never branch on `config.useMockApi` directly — they consume
 * `services.<domain>` and remain agnostic to the source.
 *
 * Services without a backend endpoint yet (analytics) are wired to mocks
 * in both modes until the backend exposes them.
 */
export const services = {
  auth: config.useMockApi ? mockAuthService : apiAuthService,
  user: config.useMockApi ? mockUserService : apiUserService,
  department: config.useMockApi ? mockDepartmentService : apiDepartmentService,
  grievance: config.useMockApi ? mockGrievanceService : apiGrievanceService,
  notification: config.useMockApi
    ? mockNotificationService
    : apiNotificationService,

  // SLA is now REAL API backed (V6.0a: GET /api/v1/slas endpoints); mock mode
  // remains available for standalone development.
  sla: config.useMockApi ? mockSlaService : apiSlaService,

  // Escalation is now REAL API backed (V6.0b: GET /api/v1/escalations endpoints);
  // mock mode remains available for standalone development.
  escalation: config.useMockApi ? mockEscalationService : apiEscalationService,
  analytics: mockAnalyticsService,

  // Audit is now REAL API backed (V6.0c: GET /api/v1/audit-logs endpoints);
  // mock mode remains available for standalone development.
  audit: config.useMockApi ? mockAuditService : apiAuditService,

  // AI is now REAL API backed (Phase 7.1: POST /api/v1/chat and persisted AI classification);
  // mock mode remains available for standalone development.
  ai: config.useMockApi ? mockAiService : apiAiService,
} satisfies {
  auth: AuthService
  user: UserService
  department: DepartmentService
  grievance: GrievanceService
  notification: NotificationService
  sla: SlaService
  escalation: EscalationService
  analytics: AnalyticsService
  audit: AuditService
  ai: AiService
}
