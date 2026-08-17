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
import { GrievanceTimeline } from '../../components/timeline'
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
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-xl" />
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
          className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
          className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
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
                  className="gd-file focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span className="gd-file-icon">
                    <FileText className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="gd-file-name block truncate">{attachment.fileName}</span>
                    <span className="gd-file-meta block">
                      {formatFileSize(attachment.fileSize)} · {formatDateTime(attachment.createdAt)}
                    </span>
                  </span>
                  <span className="gd-file-open">Open</span>
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
          <Skeleton className="h-40 rounded-xl" />
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
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
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
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="gd-comment">
                <div className="flex items-center justify-between gap-2">
                  <span className="gd-comment-author">
                    {comment.user?.name ?? 'Department'}
                  </span>
                  <span className="gd-comment-meta">{formatDateTime(comment.createdAt)}</span>
                </div>
                {comment.user?.role && (
                  <p className="gd-comment-role mt-0.5">{ROLE_LABELS[comment.user.role]}</p>
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
        className="gd-back mb-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
                <span className="font-system text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                  {grievance.ticketId}
                </span>
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
              </div>
              <CardTitle className="mt-1 font-editorial text-2xl font-semibold tracking-tight">
                {grievance.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {grievance.description}
              </p>

              <dl className="gd-meta grid grid-cols-1 gap-4 border-t border-ucg-fog pt-5 text-sm sm:grid-cols-2">
                <div>
                  <dt>
                    <FolderOpen className="size-3.5" aria-hidden="true" />
                    Category
                  </dt>
                  <dd>{grievance.category ?? '—'}</dd>
                </div>
                <div>
                  <dt>
                    <Building2 className="size-3.5" aria-hidden="true" />
                    Department
                  </dt>
                  <dd>{grievance.department?.name ?? 'To be assigned'}</dd>
                </div>
                <div>
                  <dt>
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Location
                  </dt>
                  <dd>{grievance.location ?? grievance.address ?? '—'}</dd>
                </div>
                <div>
                  <dt>
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Submitted
                  </dt>
                  <dd>{formatDateTime(grievance.createdAt)}</dd>
                </div>
                <div>
                  <dt>
                    <UserRound className="size-3.5" aria-hidden="true" />
                    Assigned officer
                  </dt>
                  <dd>{grievance.assignedOfficer?.name ?? 'Not assigned yet'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Where this grievance is in its lifecycle.</CardDescription>
            </CardHeader>
            <CardContent>
              <GrievanceTimeline grievance={grievance} />
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
