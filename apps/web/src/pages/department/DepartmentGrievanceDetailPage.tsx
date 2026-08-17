import { useMemo, useState, type FormEvent } from 'react'
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
  Send,
  ShieldAlert,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../auth/auth-context'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import type { Attachment } from '../../contracts/attachment'
import type { Comment } from '../../contracts/comment'
import type { Sla } from '../../contracts/sla'
import { PriorityBadge, StatusBadge } from '../../components/grievance'
import { SLAIndicator } from '../../components/sla/SLAIndicator'
import { GrievanceTimeline } from '../../components/timeline'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import {
  availableTransitions,
  TRANSITION_LABELS,
} from '../../components/department/statusWorkflow'

function formatFileSize(bytes?: number | null): string {
  if (!bytes) {
    return ''
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Officer actions — assignment (department admin) + status transitions. */
function OfficerActions({ grievanceId }: { grievanceId: string }) {
  const { user } = useAuth()
  const { success: successToast, error: errorToast } = useToast()

  const grievanceQuery = useAsync(() => services.grievance.getById(grievanceId), [grievanceId])
  const officersQuery = useAsync(
    () =>
      services.user.listUsers({
        role: 'OFFICER',
        departmentId: user?.departmentId ?? undefined,
        limit: 50,
      }),
    [user?.departmentId],
  )
  const escalationQuery = useAsync(
    () => services.escalation.getByGrievance(grievanceId),
    [grievanceId],
  )

  const [selectedOfficerId, setSelectedOfficerId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const grievance = grievanceQuery.data
  const role = user?.role
  const isOfficer = role === 'OFFICER'
  const isDeptAdmin = role === 'DEPARTMENT_ADMIN'
  const isAssignedToMe =
    isOfficer && grievance?.assignedOfficer?.id === user?.id

  const transitions = useMemo(() => {
    if (!grievance || !role) {
      return []
    }
    const all = availableTransitions(grievance.status, role)
    // Officers may only act on grievances assigned to them.
    if (isOfficer && !isAssignedToMe) {
      return []
    }
    return all
  }, [grievance, role, isOfficer, isAssignedToMe])

  const canAssign =
    isDeptAdmin &&
    !!grievance &&
    !grievance.assignedOfficer &&
    (grievance.status === 'SUBMITTED' || grievance.status === 'AI_CLASSIFIED')

  async function handleAssign() {
    if (!selectedOfficerId || !grievance || isAssigning) {
      return
    }
    setIsAssigning(true)
    try {
      await services.grievance.assign(grievance.id, { officerId: selectedOfficerId })
      successToast({ title: 'Grievance assigned', description: 'The officer has been assigned to this grievance.' })
      setSelectedOfficerId('')
      grievanceQuery.reload()
    } catch (assignError) {
      errorToast({ title: 'Could not assign grievance', description: getErrorMessage(assignError) })
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleTransition(status: string) {
    if (!grievance || isTransitioning) {
      return
    }
    setIsTransitioning(true)
    try {
      await services.grievance.updateStatus(grievance.id, { status: status as never })
      successToast({ title: 'Status updated', description: `${grievance.ticketId} is now ${status.replace('_', ' ').toLowerCase()}.` })
      setPendingTransition(null)
      grievanceQuery.reload()
    } catch (transitionError) {
      errorToast({ title: 'Could not update status', description: getErrorMessage(transitionError) })
    } finally {
      setIsTransitioning(false)
    }
  }

  if (grievanceQuery.isLoading) {
    return <Skeleton className="h-48 rounded-2xl" />
  }

  if (grievanceQuery.isError) {
    return (
      <p className="text-sm text-slate-500">
        Actions could not be loaded.{' '}
        <button
          type="button"
          onClick={grievanceQuery.reload}
          className="font-medium text-ucg-blue hover:underline"
        >
          Try again
        </button>
      </p>
    )
  }

  if (!grievance) {
    return null
  }

  const showActions = transitions.length > 0 || canAssign
  const escalated = grievance.status === 'ESCALATED'
  const escalation = escalated ? (escalationQuery.data?.[0] ?? null) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-slate-400" aria-hidden="true" />
          <CardTitle>Officer actions</CardTitle>
        </div>
        <CardDescription>
          Assignment and status workflow for {grievance.ticketId}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current assignment */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ucg-fog bg-ucg-paper/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-ucg-blue/10 text-ucg-blue">
              <UserRound className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-ucg-ink">
                {grievance.assignedOfficer?.name ?? 'Not assigned'}
              </p>
              <p className="dp-meta mt-0.5">
                {grievance.assignedOfficer
                  ? 'Assigned officer'
                  : 'Awaiting assignment'}
              </p>
            </div>
          </div>
          {isOfficer && (
            <span className="rounded-full bg-ucg-blue/10 px-3 py-1 font-system text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ucg-blue">
              {isAssignedToMe ? 'Your case' : 'Not your case'}
            </span>
          )}
        </div>

        {/* Escalation context */}
        {escalated && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3">
            <p className="flex items-center gap-2 font-system text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-red-700">
              <ShieldAlert className="size-3.5" aria-hidden="true" />
              Escalated
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {escalation?.reason ??
                'This grievance has been escalated to senior attention.'}
            </p>
            {escalation && (
              <p className="dp-meta mt-1">
                Level {escalation.level.replace('_', ' ')} · {escalation.status} ·{' '}
                {formatDateTime(escalation.escalatedAt)}
              </p>
            )}
          </div>
        )}

        {/* Assignment control */}
        {canAssign && (
          <div className="space-y-3 rounded-xl border border-ucg-fog p-4">
            <p className="dp-meta">Assign to officer</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                label="Officer"
                name="officer"
                placeholder="Select an officer"
                options={(officersQuery.data?.items ?? []).map((officer) => ({
                  value: officer.id,
                  label: officer.name,
                }))}
                value={selectedOfficerId}
                onChange={(event) => setSelectedOfficerId(event.target.value)}
                aria-label="Assign officer"
                labelClassName="gl-field-label"
                className="ucg-input-field w-full sm:max-w-xs"
              />
              <Button
                type="button"
                onClick={handleAssign}
                isLoading={isAssigning}
                disabled={!selectedOfficerId || isAssigning}
                className="self-end"
              >
                Assign
              </Button>
            </div>
            {officersQuery.isError && (
              <p className="text-xs text-red-600">
                Could not load officers.{' '}
                <button
                  type="button"
                  onClick={officersQuery.reload}
                  className="font-medium underline"
                >
                  Try again
                </button>
              </p>
            )}
          </div>
        )}

        {/* Status transitions */}
        {showActions && (
          <div className="space-y-3">
            <p className="dp-meta">Status transition</p>
            <div className="flex flex-wrap gap-2">
              {transitions.map((nextStatus) => {
                const needsConfirm = nextStatus === 'RESOLVED' || nextStatus === 'REJECTED'
                return (
                  <Button
                    key={nextStatus}
                    type="button"
                    variant={nextStatus === 'REJECTED' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() =>
                      needsConfirm
                        ? setPendingTransition(nextStatus)
                        : handleTransition(nextStatus)
                    }
                    isLoading={isTransitioning && pendingTransition === nextStatus}
                    disabled={isTransitioning}
                  >
                    {TRANSITION_LABELS[nextStatus]}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">
              {isOfficer
                ? 'As an officer you can move assigned cases to in progress or resolved.'
                : 'Department admins manage the workflow; assignment and AI classification are handled by their dedicated flows.'}
            </p>
          </div>
        )}

        {!showActions && (
          <p className="text-sm text-slate-500">
            No status actions are available for this grievance in its current
            state.
          </p>
        )}
      </CardContent>

      {pendingTransition && (
        <ConfirmDialog
          open
          title={
            pendingTransition === 'REJECTED'
              ? 'Reject this grievance?'
              : 'Mark this grievance resolved?'
          }
          description={`${grievance.ticketId} will be ${pendingTransition.toLowerCase()}. This moves it out of the active queue.`}
          confirmLabel={pendingTransition === 'REJECTED' ? 'Reject' : 'Mark resolved'}
          variant={pendingTransition === 'REJECTED' ? 'danger' : 'primary'}
          isLoading={isTransitioning}
          onConfirm={() => handleTransition(pendingTransition)}
          onCancel={() => setPendingTransition(null)}
        />
      )}
    </Card>
  )
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
          <Skeleton className="h-12 rounded-xl" />
        ) : query.isError ? (
          <p className="text-sm text-slate-500">
            Attachments could not be loaded.{' '}
            <button
              type="button"
              onClick={query.reload}
              className="font-medium text-ucg-blue hover:underline"
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
              className="font-medium text-ucg-blue hover:underline"
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

function CommentsSection({ grievanceId }: { grievanceId: string }) {
  const { user } = useAuth()
  const { success: successToast, error: errorToast } = useToast()
  const query = useAsync(() => services.grievance.getComments(grievanceId), [grievanceId])

  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const comments: Comment[] = query.data ?? []
  const visibleComments = user?.role === 'CITIZEN'
    ? comments.filter((comment) => !comment.isInternal)
    : comments

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isSending) {
      return
    }
    setIsSending(true)
    try {
      await services.grievance.addComment(grievanceId, {
        message: trimmed,
        ...(user?.role === 'CITIZEN' ? {} : { isInternal }),
      })
      successToast({ title: 'Update added', description: 'The comment has been posted to this grievance.' })
      setMessage('')
      setIsInternal(false)
      query.reload()
    } catch (commentError) {
      errorToast({ title: 'Could not add update', description: getErrorMessage(commentError) })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-slate-400" aria-hidden="true" />
          <CardTitle>Updates & communication</CardTitle>
        </div>
        <CardDescription>Officer updates, replies and internal notes on this grievance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading ? (
          <Skeleton className="h-14 rounded-xl" />
        ) : query.isError ? (
          <p className="text-sm text-slate-500">
            Updates could not be loaded.{' '}
            <button
              type="button"
              onClick={query.reload}
              className="font-medium text-ucg-blue hover:underline"
            >
              Try again
            </button>
          </p>
        ) : visibleComments.length === 0 ? (
          <p className="text-sm text-slate-500">No updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {visibleComments.map((comment) => (
              <li key={comment.id} className="gd-comment">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="gd-comment-author">
                    {comment.user?.name ?? 'Department'}
                  </span>
                  <span className="flex items-center gap-2">
                    {comment.isInternal && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wide text-amber-800">
                        Internal
                      </span>
                    )}
                    <span className="gd-comment-meta">{formatDateTime(comment.createdAt)}</span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{comment.message}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Staff composer */}
        <form onSubmit={handleAddComment} className="space-y-3 border-t border-ucg-fog pt-4">
          <Textarea
            label="Add an update"
            name="comment"
            rows={3}
            placeholder="Post an update visible to the citizen, or mark it as an internal note…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isSending}
            className="ucg-input-field"
            labelClassName="auth-label"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {user?.role !== 'CITIZEN' && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(event) => setIsInternal(event.target.checked)}
                  disabled={isSending}
                  className="size-4 rounded border-slate-300 text-ucg-blue focus:ring-ucg-blue"
                />
                Internal note (not visible to citizen)
              </label>
            )}
            <Button
              type="submit"
              size="sm"
              isLoading={isSending}
              disabled={!message.trim() || isSending}
            >
              <Send className="size-3.5" aria-hidden="true" />
              Post update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ForbiddenState() {
  return (
    <EmptyState
      icon={Lock}
      title="You don't have access to this grievance"
      description="This grievance is outside your department's scope."
      action={
        <Link
          to="/department/grievances"
          className="inline-flex h-9 items-center justify-center rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Back to the queue
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
          to="/department/grievances"
          className="inline-flex h-9 items-center justify-center rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Back to the queue
        </Link>
      }
    />
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

/** Department grievance detail — Civic Duty (V4.5b). */
export function DepartmentGrievanceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const grievanceQuery = useAsync(
    () => (id ? services.grievance.getById(id) : Promise.reject(new Error('Missing grievance id'))),
    [id],
  )

  if (grievanceQuery.isLoading) {
    return <DetailSkeleton />
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
        to="/department/grievances"
        className="gd-back mb-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the queue
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
                    Citizen
                  </dt>
                  <dd>{grievance.citizen?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt>
                    <UsersRound className="size-3.5" aria-hidden="true" />
                    Assigned officer
                  </dt>
                  <dd>{grievance.assignedOfficer?.name ?? 'Not assigned yet'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <OfficerActions grievanceId={grievance.id} />

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
          <CommentsSection grievanceId={grievance.id} />
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <SlaSection grievanceId={grievance.id} />
        </div>
      </div>
    </div>
  )
}
