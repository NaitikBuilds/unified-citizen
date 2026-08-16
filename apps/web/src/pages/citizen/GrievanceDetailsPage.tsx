import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  FolderOpen,
  Lock,
  MapPin,
  MessageSquareText,
  SearchX,
  UserRound,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import type { Attachment } from '../../contracts/attachment'
import type { Comment } from '../../contracts/comment'
import type { Sla } from '../../contracts/sla'
import { ROLE_LABELS } from '../../auth/roles'
import { PriorityBadge, StatusBadge } from '../../components/grievance'
import { AIAnalysisCard, DuplicateWarning } from '../../components/ai'
import { SLAIndicator } from '../../components/sla/SLAIndicator'
import {
  Card,
  CardContent,
  CardDescription,
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
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
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

function formatFileSize(bytes?: number | null): string {
  if (!bytes) {
    return ''
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AttachmentsSection({ grievanceId }: { grievanceId: string }) {
  const query = useAsync(() => services.grievance.getAttachments(grievanceId), [grievanceId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
        <CardDescription>Photos and documents submitted with this grievance.</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        ) : query.isError ? (
          <p className="text-sm text-slate-500">
            Attachments could not be loaded.{' '}
            <button
              type="button"
              onClick={query.reload}
              className="font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Try again
            </button>
          </p>
        ) : (query.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">No attachments were added.</p>
        ) : (
          <ul className="space-y-2">
            {query.data?.map((attachment: Attachment) => (
              <li key={attachment.id}>
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="size-4.5 text-slate-500" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {attachment.fileName}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatFileSize(attachment.fileSize)} · {formatDateTime(attachment.createdAt)}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-blue-600">Open</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function SlaSection({ grievanceId }: { grievanceId: string }) {
  const query = useAsync(() => services.sla.getByGrievance(grievanceId), [grievanceId])
  const sla: Sla | null = query.data ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle>SLA</CardTitle>
        <CardDescription>Response and resolution deadlines for this grievance.</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <Skeleton className="h-32 rounded-lg" />
        ) : query.isError ? (
          <p className="text-sm text-slate-500">
            SLA details could not be loaded.{' '}
            <button
              type="button"
              onClick={query.reload}
              className="font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Try again
            </button>
          </p>
        ) : sla ? (
          <SLAIndicator sla={sla} />
        ) : (
          <p className="text-sm text-slate-500">
            No SLA has been assigned to this grievance yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CommentsShell({ grievanceId }: { grievanceId: string }) {
  const query = useAsync(() => services.grievance.getComments(grievanceId), [grievanceId])
  const comments: Comment[] = query.data ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-slate-400" aria-hidden="true" />
          <CardTitle>Updates & communication</CardTitle>
        </div>
        <CardDescription>
          Officer updates and replies on this grievance. Adding comments is coming in a
          later step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : query.isError ? (
          <p className="text-sm text-slate-500">
            Updates could not be loaded.{' '}
            <button
              type="button"
              onClick={query.reload}
              className="font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Try again
            </button>
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500">
            No updates yet. You will be notified when the department responds.
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {comment.user?.name ?? 'Department'}
                  </span>
                  <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
                </div>
                {comment.user?.role && (
                  <p className="text-xs text-slate-500">{ROLE_LABELS[comment.user.role]}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{comment.message}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/** Grievance details — Member 4, Steps 89–93. */
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
        {/* Main column */}
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
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                    <UserRound className="size-3.5" aria-hidden="true" />
                    Assigned officer
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {grievance.assignedOfficer?.name ?? 'Not assigned yet'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <AttachmentsSection grievanceId={grievance.id} />
          <CommentsShell grievanceId={grievance.id} />
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <AIAnalysisCard
            result={aiQuery.data}
            isLoading={aiQuery.isLoading}
            onRetry={aiQuery.reload}
          />
          <DuplicateWarning matches={aiQuery.data?.duplicates ?? []} />
          <SlaSection grievanceId={grievance.id} />
        </div>
      </div>
    </div>
  )
}
