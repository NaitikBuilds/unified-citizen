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
      accent: 'bg-blue-600',
    },
    {
      key: 'pending',
      label: 'Pending',
      description: 'Awaiting AI classification or assignment',
      count: counts.pending,
      href: statusQuery(METRIC_GROUPS.pending),
      icon: Inbox,
      accent: 'bg-slate-500',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      description: 'Assigned and being worked on',
      count: counts.inProgress,
      href: statusQuery(METRIC_GROUPS.inProgress),
      icon: Clock3,
      accent: 'bg-amber-500',
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
      accent: 'bg-red-500',
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
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      aria-label={`${metric.label}: ${metric.count}. View ${metric.label.toLowerCase()} grievances`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-9 items-center justify-center rounded-lg ${metric.accent} text-white`}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span
          className="text-lg font-bold tabular-nums text-slate-900"
          aria-label={`${metric.count}`}
        >
          {count}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{metric.label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{metric.description}</p>
    </button>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="px-6 py-10 sm:px-10">
          <Skeleton className="mb-3 h-3 w-40 bg-slate-700" />
          <Skeleton className="mb-4 h-8 w-72 max-w-full bg-slate-700" />
          <Skeleton className="h-4 w-96 max-w-full bg-slate-700" />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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

  return (
    <div className="space-y-8">
      {/* Hero — editorial civic composition with a subtle digital grid accent */}
      <section
        aria-label="Dashboard overview"
        className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            <span>Citizen Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>{today}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              All systems operational
            </span>
          </div>

          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {greeting()}, {firstName}.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            Here is the current state of your reported grievances. Track progress,
            check deadlines and submit new reports — all in one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/citizen/submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              Report a grievance
            </Link>
            <Link
              to="/citizen/grievances"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              View all grievances
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Grievance summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      {/* Recent grievances */}
      <section aria-label="Recent grievances">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Recent grievances</h3>
          <Link
            to="/citizen/grievances"
            className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No grievances yet"
            description="When you report an issue, it will appear here with live status and deadline tracking."
            action={
              <Link
                to="/citizen/submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Report your first grievance
              </Link>
            }
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-slate-100 p-0">
              {recent.map((grievance) => (
                <Link
                  key={grievance.id}
                  to={`/citizen/grievances/${grievance.id}`}
                  className="block transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
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
