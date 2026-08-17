import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Inbox,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react'
import type { Grievance, GrievanceStatus } from '../../contracts/grievance'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useCountUp } from '../../hooks/useCountUp'
import { useAuth } from '../../auth/auth-context'
import { getErrorMessage } from '../../utils/errors'
import { GrievanceCard } from '../../components/grievance'
import {
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonCard,
} from '../../components/ui'

/**
 * Status groups powering the dashboard metrics. Pending spans the pre-assignment
 * states; In Progress spans assigned-and-working states. Clicking a metric
 * navigates to My Grievances pre-filtered with the same statuses.
 */
const METRIC_GROUPS: Record<string, GrievanceStatus[]> = {
  pending: ['SUBMITTED', 'AI_CLASSIFIED'],
  inProgress: ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'],
  resolved: ['RESOLVED'],
  escalated: ['ESCALATED'],
}

interface Metric {
  key: string
  label: string
  description: string
  count: number
  href: string
  icon: typeof Inbox
  /** Restrained signal edge tint — semantic, never full-card color. */
  accent: string
}

function buildMetrics(grievances: Grievance[]): Metric[] {
  const counts = Object.fromEntries(
    Object.entries(METRIC_GROUPS).map(([key, statuses]) => [
      key,
      grievances.filter((grievance) => statuses.includes(grievance.status)).length,
    ]),
  )

  const statusQuery = (statuses: GrievanceStatus[]): string => {
    const params = new URLSearchParams()
    statuses.forEach((status) => params.append('status', status))
    return `/citizen/grievances?${params.toString()}`
  }

  return [
    {
      key: 'total',
      label: 'Total',
      description: 'All reported grievances',
      count: grievances.length,
      href: '/citizen/grievances',
      icon: ClipboardList,
      accent: 'bg-ucg-blue',
    },
    {
      key: 'pending',
      label: 'Pending',
      description: 'Awaiting AI classification or assignment',
      count: counts.pending,
      href: statusQuery(METRIC_GROUPS.pending),
      icon: Inbox,
      accent: 'bg-ucg-electric',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      description: 'Assigned and being worked on',
      count: counts.inProgress,
      href: statusQuery(METRIC_GROUPS.inProgress),
      icon: Clock3,
      accent: 'bg-ucg-signal',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      description: 'Completed and closed out',
      count: counts.resolved,
      href: statusQuery(METRIC_GROUPS.resolved),
      icon: ShieldAlert,
      accent: 'bg-emerald-500',
    },
    {
      key: 'escalated',
      label: 'Escalated',
      description: 'Raised to senior attention',
      count: counts.escalated,
      href: statusQuery(METRIC_GROUPS.escalated),
      icon: ShieldAlert,
      accent: 'bg-ucg-critical',
    },
  ]
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'Good morning'
  }
  if (hour < 17) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

function MetricCard({ metric }: { metric: Metric }) {
  const navigate = useNavigate()
  const count = useCountUp(metric.count)
  const Icon = metric.icon

  return (
    <button
      type="button"
      onClick={() => navigate(metric.href)}
      className="dash-metric p-4"
      aria-label={`${metric.label}: ${metric.count}. View ${metric.label.toLowerCase()} grievances`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-0.5 ${metric.accent} opacity-90`}
      />
      <div className="flex items-center justify-between">
        <span className="dash-metric-icon">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span
          className="dash-metric-count"
          aria-label={`${metric.count}`}
        >
          {count}
        </span>
      </div>
      <p className="dash-metric-label mt-3 inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${metric.accent}`}
        />
        {metric.label}
      </p>
      <p className="dash-metric-desc mt-1">{metric.description}</p>
    </button>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-ucg-midnight">
        <div className="px-6 py-10 sm:px-10">
          <Skeleton className="mb-3 h-3 w-44 bg-slate-700" />
          <Skeleton className="mb-4 h-9 w-80 max-w-full bg-slate-700" />
          <Skeleton className="h-4 w-[26rem] max-w-full bg-slate-700" />
          <div className="mt-7 flex gap-3">
            <Skeleton className="h-10 w-44 rounded-full bg-slate-700" />
            <Skeleton className="h-10 w-40 rounded-full bg-slate-700/60" />
          </div>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl border border-slate-200/60 bg-white" />
        ))}
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-56 bg-slate-200" />
        <Skeleton className="h-8 w-24 rounded-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </>
  )
}

/** Citizen dashboard — Member 4, Step 87. */
export function CitizenDashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading, isError, reload } = useAsync(() =>
    services.grievance.list({ limit: 100 }),
  )

  const metrics = useMemo(() => buildMetrics(data?.items ?? []), [data])
  const recent = useMemo(() => (data?.items ?? []).slice(0, 4), [data])

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        message={getErrorMessage(error)}
        onRetry={reload}
      />
    )
  }

  const total = metrics.find((metric) => metric.key === 'total')?.count ?? 0

  return (
    <div className="space-y-8">
      {/* Hero — midnight civic composition with a digital-intelligence readout */}
      <section aria-label="Dashboard overview" className="dash-hero dash-enter">
        <div className="relative flex flex-col gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="dash-hero-overline">Citizen Dashboard</span>
              <span aria-hidden="true" className="dash-hero-overline opacity-50">
                /
              </span>
              <span className="dash-hero-overline">{today}</span>
              <span className="dash-status rounded-full px-2.5 py-1">
                <span className="dash-status-dot" aria-hidden="true" />
                All systems operational
              </span>
            </div>

            <h2 className="dash-hero-title mt-4 max-w-2xl text-3xl sm:text-4xl">
              {greeting()}, {firstName}.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
              Here is the current state of your reported grievances. Track progress,
              check deadlines and submit new reports — all in one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/citizen/submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Report a grievance
              </Link>
              <Link
                to="/citizen/grievances"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                View all grievances
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className="dash-readout hidden w-60 shrink-0 flex-col gap-3 rounded-2xl p-4 lg:flex"
            aria-label="System readout"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="dash-readout-label">Total reports</span>
              <span className="dash-readout-value text-2xl font-semibold">
                {total}
              </span>
            </div>
            <div className="h-px bg-white/10" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
              <span className="dash-readout-label">Status</span>
              <span className="dash-readout-value inline-flex items-center gap-1.5 text-sm">
                <span className="dash-status-dot" aria-hidden="true" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Grievance summary" className="dash-enter" style={{ animationDelay: '80ms' }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      {/* Recent grievances */}
      <section aria-label="Recent grievances" className="dash-enter" style={{ animationDelay: '160ms' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="dash-section-eyebrow">Your grievances</span>
            <h3 className="dash-section-title">Recent grievances</h3>
          </div>
          <Link to="/citizen/grievances" className="dash-viewall">
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="dash-empty">
            <EmptyState
              icon={ClipboardList}
              title="No grievances yet"
              description="When you report an issue, it will appear here with live status and deadline tracking."
              action={
                <Link
                  to="/citizen/submit"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusCircle className="size-4" aria-hidden="true" />
                  Report your first grievance
                </Link>
              }
            />
          </div>
        ) : (
          <Card className="dash-list">
            <CardContent className="divide-y divide-slate-100 p-0">
              {recent.map((grievance) => (
                <Link
                  key={grievance.id}
                  to={`/citizen/grievances/${grievance.id}`}
                  className="dash-row-link"
                >
                  <GrievanceCard grievance={grievance} className="border-0 bg-transparent shadow-none" />
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
