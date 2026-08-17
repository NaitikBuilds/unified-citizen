import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Inbox,
  ListTodo,
  ShieldAlert,
  Timer,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../auth/auth-context'
import { getErrorMessage } from '../../utils/errors'
import { formatDate } from '../../utils/format'
import { PriorityBadge, StatusBadge } from '../../components/grievance'
import { ErrorState, Skeleton } from '../../components/ui'
import { SLA_STATUS_LABELS } from '../../components/sla/slaMeta'
import { useCountUp } from '../../hooks/useCountUp'

const OPEN_STATUSES = new Set([
  'SUBMITTED',
  'AI_CLASSIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'REOPENED',
])

function Metric({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note: string
}) {
  const count = useCountUp(value)
  return (
    <div className="dp-metric">
      <p className="dp-metric-label">{label}</p>
      <p className="dp-metric-value">{count}</p>
      <p className="dp-metric-note">{note}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-56 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

/** Department / Officer operations dashboard — Civic Duty (V4.5b). */
export function DepartmentDashboardPage() {
  const { user } = useAuth()
  const departmentId = user?.departmentId ?? null

  const grievanceQuery = useAsync(
    () =>
      departmentId
        ? services.grievance.list({ departmentId, limit: 100 })
        : Promise.resolve({ items: [], page: 1, limit: 100, total: 0, totalPages: 1 }),
    [departmentId],
  )
  const slaQuery = useAsync(
    () =>
      departmentId
        ? services.sla.list({ departmentId, limit: 100 })
        : Promise.resolve({ items: [], page: 1, limit: 100, total: 0, totalPages: 1 }),
    [departmentId],
  )
  const escalationQuery = useAsync(
    () => services.escalation.list({ limit: 100 }),
    [],
  )

  const departmentName = useMemo(() => {
    const first = grievanceQuery.data?.items[0]
    return first?.department?.name ?? 'Department'
  }, [grievanceQuery.data])

  const metrics = useMemo(() => {
    const items = grievanceQuery.data?.items ?? []
    const open = items.filter((grievance) => OPEN_STATUSES.has(grievance.status))
    return {
      total: items.length,
      open: open.length,
      unassigned: open.filter((grievance) => !grievance.assignedOfficer).length,
      inProgress: items.filter((grievance) => grievance.status === 'IN_PROGRESS').length,
      resolved: items.filter((grievance) => grievance.status === 'RESOLVED').length,
      escalated: items.filter((grievance) => grievance.status === 'ESCALATED').length,
    }
  }, [grievanceQuery.data])

  // Escalations scoped to THIS department by matching their grievance against
  // the department's own grievance set (the escalation list is mock-only).
  const departmentEscalations = useMemo(() => {
    const grievanceIds = new Set(
      (grievanceQuery.data?.items ?? []).map((grievance) => grievance.id),
    )
    return (escalationQuery.data?.items ?? []).filter((escalation) =>
      grievanceIds.has(escalation.grievanceId),
    )
  }, [escalationQuery.data, grievanceQuery.data])

  const slaCounts = useMemo(() => {
    const counts = { ACTIVE: 0, WARNING: 0, BREACHED: 0, COMPLETED: 0, PAUSED: 0 }
    for (const sla of slaQuery.data?.items ?? []) {
      if (sla.status in counts) {
        counts[sla.status as keyof typeof counts] += 1
      }
    }
    return counts
  }, [slaQuery.data])

  const atRisk = slaCounts.WARNING + slaCounts.BREACHED
  const openEscalations = departmentEscalations.filter(
    (escalation) => escalation.status === 'OPEN' || escalation.status === 'ACKNOWLEDGED',
  ).length

  const queuePreview = (grievanceQuery.data?.items ?? []).slice(0, 5)

  if (grievanceQuery.isLoading && !grievanceQuery.data) {
    return <DashboardSkeleton />
  }

  if (grievanceQuery.isError) {
    return (
      <ErrorState
        title="Could not load the department dashboard"
        message={getErrorMessage(grievanceQuery.error)}
        onRetry={grievanceQuery.reload}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Operational hero */}
      <section className="dp-hero px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="dp-hero-overline flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-ucg-signal" aria-hidden="true" />
              Civic Duty / Operations
            </p>
            <h1 className="dp-hero-title mt-3">
              {departmentName} Dashboard
            </h1>
            <p className="dp-hero-sub mt-3">
              {formatDate(new Date().toISOString())} — workload, SLA status and
              escalations across your department. Every number is derived from
              live grievance data.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="dp-status-pill">
              <span className="dp-status-dot" aria-hidden="true" />
              Operations live
            </span>
            <Link
              to="/department/grievances"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white/95 px-4 text-sm font-medium text-ucg-ink transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Open full queue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workload metrics */}
      <section aria-label="Workload metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Total" value={metrics.total} note="In this department" />
        <Metric label="Open" value={metrics.open} note="Awaiting action" />
        <Metric label="Unassigned" value={metrics.unassigned} note="No officer yet" />
        <Metric label="In progress" value={metrics.inProgress} note="Being worked" />
        <Metric label="Resolved" value={metrics.resolved} note="Completed" />
        <Metric label="Escalated" value={metrics.escalated} note="Senior attention" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Queue preview */}
        <section className="rounded-2xl border border-ucg-fog bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="dp-panel-label flex items-center gap-2">
                <ListTodo className="size-3.5" aria-hidden="true" />
                Assignment queue
              </p>
              <h2 className="mt-1 font-editorial text-xl font-semibold tracking-tight text-ucg-ink">
                Recent grievances
              </h2>
            </div>
            <Link
              to="/department/grievances"
              className="inline-flex items-center gap-1.5 rounded-full border border-ucg-fog px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-ucg-blue/40 hover:text-ucg-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {queuePreview.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-ucg-fog/70">
                <Inbox className="size-5 text-slate-400" aria-hidden="true" />
              </span>
              <p className="text-sm text-slate-500">
                No grievances in this department yet.
              </p>
            </div>
          ) : (
            <ul>
              {queuePreview.map((grievance) => (
                <li key={grievance.id}>
                  <Link
                    to={`/department/grievances/${grievance.id}`}
                    className="dp-row group"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="min-w-0">
                        <p className="dp-ticket">{grievance.ticketId}</p>
                        <p className="dp-row-title mt-0.5 truncate group-hover:text-ucg-blue">
                          {grievance.title}
                        </p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 sm:block">
                      <StatusBadge status={grievance.status} />
                    </span>
                    <span className="shrink-0">
                      <PriorityBadge priority={grievance.priority} />
                    </span>
                    <span className="dp-meta hidden w-28 shrink-0 truncate text-right md:block">
                      {grievance.assignedOfficer?.name ?? 'Unassigned'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Operational readouts */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-ucg-fog bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="dp-panel-label flex items-center gap-2">
                <Timer className="size-3.5" aria-hidden="true" />
                SLA status
              </p>
              <span className="dp-demo-badge" title="Mock service — no backend endpoint">
                Demo data
              </span>
            </div>
            {slaQuery.isLoading ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : slaQuery.isError ? (
              <p className="text-sm text-slate-500">
                Could not load SLA data.{' '}
                <button
                  type="button"
                  onClick={slaQuery.reload}
                  className="font-medium text-ucg-blue hover:underline"
                >
                  Try again
                </button>
              </p>
            ) : (
              <dl className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="dp-meta">Active</dt>
                  <dd className="text-sm font-medium text-ucg-ink">{slaCounts.ACTIVE}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="dp-meta">At risk</dt>
                  <dd className={atRisk > 0 ? 'text-sm font-semibold text-ucg-critical' : 'text-sm font-medium text-ucg-ink'}>
                    {atRisk}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="dp-meta">Warning</dt>
                  <dd className="text-sm font-medium text-ucg-ink">{slaCounts.WARNING}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="dp-meta">Breached</dt>
                  <dd className="text-sm font-medium text-ucg-ink">{slaCounts.BREACHED}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="dp-meta">Completed</dt>
                  <dd className="text-sm font-medium text-ucg-ink">{slaCounts.COMPLETED}</dd>
                </div>
                {slaQuery.data && slaQuery.data.items.length > 0 && (
                  <p className="pt-1 text-xs text-slate-400">
                    {slaQuery.data.items.length} SLA record
                    {slaQuery.data.items.length === 1 ? '' : 's'} ·{' '}
                    {SLA_STATUS_LABELS.WARNING} / {SLA_STATUS_LABELS.BREACHED} need
                    attention
                  </p>
                )}
              </dl>
            )}
          </section>

          <section className="rounded-2xl border border-ucg-fog bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="dp-panel-label flex items-center gap-2">
                <ShieldAlert className="size-3.5" aria-hidden="true" />
                Attention
              </p>
              <span className="dp-demo-badge" title="Mock service — no backend endpoint">
                Demo data
              </span>
            </div>
            {escalationQuery.isLoading ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : escalationQuery.isError ? (
              <p className="text-sm text-slate-500">
                Could not load escalations.{' '}
                <button
                  type="button"
                  onClick={escalationQuery.reload}
                  className="font-medium text-ucg-blue hover:underline"
                >
                  Try again
                </button>
              </p>
            ) : openEscalations === 0 ? (
              <p className="flex items-center gap-2 py-3 text-sm text-slate-500">
                <AlertTriangle className="size-4 text-emerald-500" aria-hidden="true" />
                No open escalations for this department.
              </p>
            ) : (
              <ul>
                {departmentEscalations
                  .filter(
                    (escalation) =>
                      escalation.status === 'OPEN' ||
                      escalation.status === 'ACKNOWLEDGED',
                  )
                  .slice(0, 4)
                  .map((escalation) => (
                    <li key={escalation.id} className="dp-attention-row">
                      <div className="min-w-0">
                        <p className="dp-ticket">{escalation.grievanceId}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-600">
                          {escalation.reason}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-red-700">
                        {escalation.level.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
