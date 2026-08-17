import type { GrievanceStatus } from '../../contracts/grievance'
import type { UserRole } from '../../contracts/auth'

/**
 * Canonical grievance status transitions — mirrors the backend exactly
 * (source of truth: apps/api/src/services/grievance-status.service.ts).
 * The backend remains the authority; this only drives which actions the
 * department UI offers.
 */
const CANONICAL_TRANSITIONS: Record<GrievanceStatus, GrievanceStatus[]> = {
  SUBMITTED: ['AI_CLASSIFIED', 'ASSIGNED', 'IN_PROGRESS'],
  AI_CLASSIFIED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'ESCALATED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['REOPENED'],
  REJECTED: [],
  REOPENED: ['IN_PROGRESS'],
}

/**
 * Role-specific transition authorization — mirrors the backend controller:
 * - OFFICER: only IN_PROGRESS / RESOLVED (and the backend additionally
 *   requires the officer to be the active assignee; the UI gates on that too).
 * - DEPARTMENT_ADMIN: ASSIGNED / AI_CLASSIFIED / REOPENED are handled
 *   outside the status endpoint (dedicated assignment endpoint, AI, citizen
 *   reopen flow) and are excluded here.
 * - SUPER_ADMIN: unrestricted (not part of the department portal).
 */
export function availableTransitions(
  status: GrievanceStatus,
  role: UserRole,
): GrievanceStatus[] {
  const canonical = CANONICAL_TRANSITIONS[status] ?? []
  if (role === 'OFFICER') {
    return canonical.filter(
      (next) => next === 'IN_PROGRESS' || next === 'RESOLVED',
    )
  }
  if (role === 'DEPARTMENT_ADMIN') {
    return canonical.filter(
      (next) =>
        next !== 'ASSIGNED' && next !== 'AI_CLASSIFIED' && next !== 'REOPENED',
    )
  }
  return canonical
}

/** Labels for transition actions, keyed by the target status. */
export const TRANSITION_LABELS: Record<GrievanceStatus, string> = {
  SUBMITTED: 'Mark submitted',
  AI_CLASSIFIED: 'Mark AI classified',
  ASSIGNED: 'Mark assigned',
  IN_PROGRESS: 'Mark in progress',
  ESCALATED: 'Escalate',
  RESOLVED: 'Mark resolved',
  REJECTED: 'Reject',
  REOPENED: 'Reopen',
}
