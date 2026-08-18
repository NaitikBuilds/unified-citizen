import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import { config } from '../../config'
import { formatDate } from '../../utils/format'
import { GRIEVANCE_STATUS_LABELS, PRIORITY_LABELS } from '../../components/grievance'
import { ErrorState, Skeleton } from '../../components/ui'
import { useCountUp } from '../../hooks/useCountUp'

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
    <div className="ad-metric">
      <p className="ad-metric-label">{label}</p>
      <p className="ad-metric-value">{count}</p>
      <p className="ad-metric-note">{note}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-52 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

/** Admin / Civic Command executive dashboard — V4.5c. */
export function AdminDashboardPage() {
  const usersQuery = useAsync(() => services.user.listUsers({ limit: 100 }), [])
  const departmentsQuery = useAsync(() => services.department.list(), [])
  const grievancesQuery = useAsync(() => services.grievance.list({ limit: 100 }), [])
  const summaryQuery = useAsync(() => services.analytics.getSummary(), [])
  const statusQuery = useAsync(() => services.analytics.getStatusDistribution(), [])
  const priorityQuery = useAsync(() => services.analytics.getPriorityDistribution(), [])
  const departmentsPerfQuery = useAsync(
    () => services.analytics.getDepartmentPerformance(),
    [],
  )
  const trendQuery = useAsync(() => services.analytics.getMonthlyTrend(), [])
  const escalationsQuery = useAsync(() => services.escalation.list({ limit: 100 }), [])

  const liveMetrics = useMemo(() => {
    const users = usersQuery.data?.items ?? []
    const grievances = grievancesQuery.data?.items ?? []
    return {
      users: users.length,
      departments: departmentsQuery.data?.length ?? 0,
      grievances: grievances.length,
      escalated: grievances.filter((grievance) => grievance.status === 'ESCALATED').length,
    }
  }, [usersQuery.data, departmentsQuery.data, grievancesQuery.data])

  const roleCounts = useMemo(() => {
    const counts = { CITIZEN: 0, OFFICER: 0, DEPARTMENT_ADMIN: 0, SUPER_ADMIN: 0 }
    for (const user of usersQuery.data?.items ?? []) {
      if (user.role in counts) {
        counts[user.role as keyof typeof counts] += 1
      }
    }
    return counts
  }, [usersQuery.data])

  const statusTotal = useMemo(
    () => (statusQuery.data ?? []).reduce((sum, item) => sum + item.count, 0),
    [statusQuery.data],
  )
  const priorityTotal = useMemo(
    () => (priorityQuery.data ?? []).reduce((sum, item) => sum + item.count, 0),
    [priorityQuery.data],
  )
  const trendMax = useMemo(() => {
    const points = trendQuery.data ?? []
    return Math.max(1, ...points.map((point) => Math.max(point.created, point.resolved)))
  }, [trendQuery.data])

  const openEscalations = (escalationsQuery.data?.items ?? []).filter(
    (escalation) => escalation.status === 'OPEN' || escalation.status === 'ACKNOWLEDGED',
  ).length

  if (grievancesQuery.isLoading && !grievancesQuery.data) {
    return <DashboardSkeleton />
  }

  if (grievancesQuery.isError) {
    return (
      <ErrorState
        title="Could not load the executive dashboard"
        message={getErrorMessage(grievancesQuery.error)}
        onRetry={grievancesQuery.reload}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Governance hero */}
      <section className="ad-hero px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="ad-hero-overline flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-ucg-signal" aria-hidden="true" />
              Civic Command / Executive
            </p>
            <h1 className="ad-hero-title mt-3">Executive Dashboard</h1>
            <p className="ad-hero-sub mt-3">
              {formatDate(new Date().toISOString())} — platform-wide governance
              metrics. Live counts come from real services; the analytics suite
              is clearly marked as demo data.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <span className="ad-status-pill">
              <span className="ad-status-dot" aria-hidden="true" />
              Governance online
            </span>
            {summaryQuery.isLoading ? null : summaryQuery.isError ? null : summaryQuery.data ? (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-system text-[0.625rem] uppercase tracking-[0.1em] text-white/85">
                  SLA compliance{' '}
                  <span className="font-semibold text-ucg-signal">
                    {Math.round((summaryQuery.data.slaComplianceRate ?? 0) * 100)}%
                  </span>
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-system text-[0.625rem] uppercase tracking-[0.1em] text-white/85">
                  Satisfaction{' '}
                  <span className="font-semibold text-ucg-signal">
                    {summaryQuery.data.satisfactionScore ?? '—'}
                  </span>
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-system text-[0.625rem] uppercase tracking-[0.1em] text-white/85">
                  Avg resolution{' '}
                  <span className="font-semibold text-ucg-signal">
                    {summaryQuery.data.avgResolutionHours
                      ? `${summaryQuery.data.avgResolutionHours}h`
                      : '—'}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Live governance metrics */}
      <section aria-label="Governance metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Citizens" value={roleCounts.CITIZEN} note="Registered" />
        <Metric label="Staff" value={roleCounts.OFFICER + roleCounts.DEPARTMENT_ADMIN} note="Officers + admins" />
        <Metric label="Departments" value={liveMetrics.departments} note="Active units" />
        <Metric label="Grievances" value={liveMetrics.grievances} note="Platform total" />
        <Metric label="Escalated" value={liveMetrics.escalated} note="Senior attention" />
        <Metric label="Open escalations" value={openEscalations} note="Attention needed" />
      </section>

      {/* Analytics suite — DEMO DATA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="ad-panel-midnight">
          <div className="mb-5 flex items-center justify-between gap-2">
            <p className="ad-panel-label">Status distribution</p>
            <span className="dp-demo-badge" title="Mock analytics service — no backend endpoint">
              Demo data
            </span>
          </div>
          {statusQuery.isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : statusQuery.isError ? (
            <p className="text-sm text-slate-400">Could not load status data.</p>
          ) : (
            <div className="space-y-3">
              {(statusQuery.data ?? []).map((item) => (
                <div key={item.status} className="ad-bar-row">
                  <span className="ad-bar-label">{GRIEVANCE_STATUS_LABELS[item.status]}</span>
                  <span className="ad-bar-track">
                    <span
                      className="ad-bar-fill"
                      style={{ width: `${statusTotal ? (item.count / statusTotal) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="ad-bar-value">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ad-panel-midnight">
          <div className="mb-5 flex items-center justify-between gap-2">
            <p className="ad-panel-label">Priority distribution</p>
            <span className="dp-demo-badge" title="Mock analytics service — no backend endpoint">
              Demo data
            </span>
          </div>
          {priorityQuery.isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : priorityQuery.isError ? (
            <p className="text-sm text-slate-400">Could not load priority data.</p>
          ) : (
            <div className="space-y-3">
              {(priorityQuery.data ?? []).map((item) => (
                <div key={item.priority} className="ad-bar-row">
                  <span className="ad-bar-label">{PRIORITY_LABELS[item.priority]}</span>
                  <span className="ad-bar-track">
                    <span
                      className="ad-bar-fill"
                      style={{ width: `${priorityTotal ? (item.count / priorityTotal) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="ad-bar-value">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Department performance */}
      <section className="rounded-2xl border border-ucg-fog bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="dp-panel-label flex items-center gap-2">
              <Building2 className="size-3.5" aria-hidden="true" />
              Department performance
            </p>
            <h2 className="mt-1 font-editorial text-xl font-semibold tracking-tight text-ucg-ink">
              How units are performing
            </h2>
          </div>
          <span className="dp-demo-badge" title="Mock analytics service — no backend endpoint">
            Demo data
          </span>
        </div>
        {departmentsPerfQuery.isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : departmentsPerfQuery.isError ? (
          <p className="text-sm text-slate-500">Could not load performance data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ucg-fog text-left">
                  <th className="dp-meta py-2 pr-4">Department</th>
                  <th className="dp-meta py-2 pr-4">Total</th>
                  <th className="dp-meta py-2 pr-4">Open</th>
                  <th className="dp-meta py-2 pr-4">Escalated</th>
                  <th className="dp-meta py-2 pr-4">SLA compliance</th>
                  <th className="dp-meta py-2 text-right">Avg resolution</th>
                </tr>
              </thead>
              <tbody>
                {(departmentsPerfQuery.data ?? []).map((department) => (
                  <tr key={department.departmentId} className="border-b border-ucg-fog last:border-b-0">
                    <td className="py-2.5 pr-4 font-medium text-ucg-ink">
                      {department.departmentName}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{department.total}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{department.open}</td>
                    <td className="py-2.5 pr-4">
                      <span className={department.escalated > 0 ? 'font-semibold text-ucg-critical' : 'text-slate-600'}>
                        {department.escalated}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={
                          (department.slaComplianceRate ?? 1) < 0.7
                            ? 'font-semibold text-ucg-critical'
                            : 'text-slate-600'
                        }
                      >
                        {department.slaComplianceRate !== undefined
                          ? `${Math.round(department.slaComplianceRate * 100)}%`
                          : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-600">
                      {department.avgResolutionHours !== undefined
                        ? `${department.avgResolutionHours}h`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <section className="ad-panel-midnight">
          <div className="mb-5 flex items-center justify-between gap-2">
            <p className="ad-panel-label">Monthly trend</p>
            <span className="dp-demo-badge" title="Mock analytics service — no backend endpoint">
              Demo data
            </span>
          </div>
          {trendQuery.isLoading ? (
            <Skeleton className="h-36 rounded-xl" />
          ) : trendQuery.isError ? (
            <p className="text-sm text-slate-400">Could not load trend data.</p>
          ) : (
            <div>
              <div className="ad-trend" role="img" aria-label="Grievances created and resolved per month">
                {(trendQuery.data ?? []).map((point) => (
                  <div key={point.month} className="ad-trend-col">
                    <div className="flex h-full w-full flex-col items-center justify-end gap-1">
                      <span
                        className="ad-trend-bar ad-trend-resolved"
                        style={{ height: `${(point.resolved / trendMax) * 100}%` }}
                        title={`${point.month}: ${point.resolved} resolved`}
                      />
                      <span
                        className="ad-trend-bar ad-trend-created"
                        style={{ height: `${(point.created / trendMax) * 100}%` }}
                        title={`${point.month}: ${point.created} created`}
                      />
                    </div>
                    <span className="ad-trend-label">{point.month.slice(5)}</span>
                  </div>
                ))}
              </div>
              <p className="ad-panel-label mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-ucg-signal/70" aria-hidden="true" />
                  Resolved
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-admin-plum" aria-hidden="true" />
                  Created
                </span>
              </p>
            </div>
          )}
        </section>

        {/* Governance attention */}
        <section className="rounded-2xl border border-ucg-fog bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="dp-panel-label flex items-center gap-2">
              <ShieldAlert className="size-3.5" aria-hidden="true" />
              Governance attention
            </p>
            {config.useMockApi ? (
              <span className="dp-demo-badge" title="Mock escalation service — no backend endpoint">
                Demo data
              </span>
            ) : (
              <span
                className="dp-status-pill"
                title="Served by the real escalation API"
              >
                <span className="dp-status-dot" aria-hidden="true" />
                Live
              </span>
            )}
          </div>
          {escalationsQuery.isLoading ? (
            <Skeleton className="h-36 rounded-xl" />
          ) : escalationsQuery.isError ? (
            <p className="text-sm text-slate-500">Could not load escalations.</p>
          ) : openEscalations === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No open escalations across the platform.
            </p>
          ) : (
            <ul>
              {(escalationsQuery.data?.items ?? [])
                .filter(
                  (escalation) =>
                    escalation.status === 'OPEN' || escalation.status === 'ACKNOWLEDGED',
                )
                .slice(0, 5)
                .map((escalation) => (
                  <li key={escalation.id} className="dp-attention-row">
                    <div className="min-w-0">
                      <p className="dp-ticket">{escalation.grievanceId}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-600">{escalation.reason}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-red-700">
                      {escalation.level.replace('_', ' ')}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-3 border-t border-ucg-fog pt-4">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 rounded-full border border-ucg-fog px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-admin-indigo/40 hover:text-admin-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-indigo"
            >
              <UserRound className="size-3.5" aria-hidden="true" />
              Manage users
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link
              to="/admin/departments"
              className="inline-flex items-center gap-1.5 rounded-full border border-ucg-fog px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-admin-indigo/40 hover:text-admin-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-indigo"
            >
              <Building2 className="size-3.5" aria-hidden="true" />
              Manage departments
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
