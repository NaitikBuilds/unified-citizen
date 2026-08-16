import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FolderOpen,
  Lock,
  MapPin,
  SearchX,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import { PriorityBadge, StatusBadge } from '../../components/grievance'
import { AIAnalysisCard, DuplicateWarning } from '../../components/ai'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../../components/ui'

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="mb-6 h-5 w-32" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function ForbiddenState() {
  return (
    <EmptyState
      icon={Lock}
      title="You don't have access to this grievance"
      description="This grievance belongs to another citizen or is outside your access scope."
      action={
        <Link
          to="/citizen/grievances"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Back to my grievances
        </Link>
      }
    />
  )
}

function NotFoundState() {
  return (
    <EmptyState
      icon={SearchX}
      title="Grievance not found"
      description="This grievance may have been removed, or the link is incorrect."
      action={
        <Link
          to="/citizen/grievances"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Back to my grievances
        </Link>
      }
    />
  )
}

/** Grievance details — Member 4, Steps 89 (AI) + 92 (details) + 93 (timeline). */
export function GrievanceDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const grievanceQuery = useAsync(
    () => (id ? services.grievance.getById(id) : Promise.reject(new Error('Missing grievance id'))),
    [id],
  )
  const aiQuery = useAsync(
    () => (id ? services.ai.analyzeGrievance(id) : Promise.reject(new Error('Missing grievance id'))),
    [id],
  )

  if (grievanceQuery.isLoading) {
    return <DetailsSkeleton />
  }

  if (grievanceQuery.isError) {
    const status = grievanceQuery.error instanceof Error
      ? 'status' in grievanceQuery.error
        ? (grievanceQuery.error as { status?: number | null }).status
        : null
      : null

    if (status === 403) {
      return <ForbiddenState />
    }
    if (status === 404) {
      return <NotFoundState />
    }
    return (
      <ErrorState
        title="Could not load this grievance"
        message={getErrorMessage(grievanceQuery.error)}
        onRetry={grievanceQuery.reload}
      />
    )
  }

  const grievance = grievanceQuery.data
  if (!grievance) {
    return <NotFoundState />
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/citizen/grievances"
        className="mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my grievances
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main complaint */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-medium text-slate-400">
                  {grievance.ticketId}
                </span>
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
              </div>
              <CardTitle className="mt-1 text-xl font-bold tracking-tight">
                {grievance.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {grievance.description}
              </p>

              <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FolderOpen className="size-3.5" aria-hidden="true" />
                    Category
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {grievance.category ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="size-3.5" aria-hidden="true" />
                    Department
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {grievance.department?.name ?? 'To be assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Location
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {grievance.location ?? grievance.address ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Submitted
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {formatDateTime(grievance.createdAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <AIAnalysisCard
            result={aiQuery.data}
            isLoading={aiQuery.isLoading}
            onRetry={aiQuery.reload}
          />
          <DuplicateWarning matches={aiQuery.data?.duplicates ?? []} />
        </div>
      </div>
    </div>
  )
}
