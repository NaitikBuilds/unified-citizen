import { useState } from 'react'
import {
  History,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FileUp,
  MessageSquare,
  Star,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import type { AuditLog } from '../../contracts/audit'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '../ui'
import { cn } from '../../utils/cn'

interface AuditTimelineProps {
  grievanceId: string
  title?: string
  description?: string
  className?: string
}

interface ActionMeta {
  label: string
  icon: typeof History
  badgeClass: string
}

const ACTION_METAS: Record<string, ActionMeta> = {
  CREATE_GRIEVANCE: {
    label: 'Grievance Submitted',
    icon: Sparkles,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UPDATE_GRIEVANCE: {
    label: 'Grievance Details Updated',
    icon: Sliders,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  UPDATE_STATUS: {
    label: 'Status Transition',
    icon: ShieldCheck,
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  ASSIGN_GRIEVANCE: {
    label: 'Officer Assigned',
    icon: UserCheck,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  COMMENT_ADDED: {
    label: 'Comment Added',
    icon: MessageSquare,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  ATTACHMENT_ADDED: {
    label: 'Attachment Uploaded',
    icon: FileUp,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  FEEDBACK_SUBMITTED: {
    label: 'Citizen Feedback',
    icon: Star,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  ESCALATE_GRIEVANCE: {
    label: 'Grievance Escalated',
    icon: AlertTriangle,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  SLA_PRIORITY_ESCALATED: {
    label: 'SLA Priority Auto-Escalated',
    icon: AlertTriangle,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  REOPEN_GRIEVANCE: {
    label: 'Grievance Reopened',
    icon: RotateCcw,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  USER_REGISTERED: {
    label: 'User Registered',
    icon: UserCheck,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  },
}

function getActionMeta(action: string): ActionMeta {
  return (
    ACTION_METAS[action] ?? {
      label: action.replace(/_/g, ' '),
      icon: History,
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    }
  )
}

function formatValueChange(log: AuditLog): string | null {
  const { action, oldValue, newValue, metadata } = log

  if (action === 'UPDATE_STATUS' && newValue) {
    const oldStatus = typeof oldValue === 'object' && oldValue && 'status' in oldValue
      ? String((oldValue as { status?: unknown }).status ?? '')
      : typeof oldValue === 'string'
        ? oldValue
        : null
    const newStatus = typeof newValue === 'object' && newValue && 'status' in newValue
      ? String((newValue as { status?: unknown }).status ?? '')
      : typeof newValue === 'string'
        ? newValue
        : null

    if (oldStatus && newStatus) {
      return `Status changed from ${oldStatus} to ${newStatus}`
    }
    if (newStatus) {
      return `Status set to ${newStatus}`
    }
  }

  if (action === 'ESCALATE_GRIEVANCE' || action === 'SLA_PRIORITY_ESCALATED') {
    const reason = typeof metadata === 'object' && metadata && 'reason' in metadata
      ? String((metadata as { reason?: unknown }).reason ?? '')
      : null
    const level = typeof newValue === 'object' && newValue && 'level' in newValue
      ? String((newValue as { level?: unknown }).level ?? '')
      : typeof newValue === 'string'
        ? newValue
        : null

    const parts = []
    if (level) parts.push(`Level: ${level}`)
    if (reason) parts.push(`Reason: ${reason}`)
    return parts.length > 0 ? parts.join(' · ') : null
  }

  if (action === 'ASSIGN_GRIEVANCE' && metadata) {
    const officerName = typeof metadata === 'object' && 'officerName' in metadata
      ? String((metadata as { officerName?: unknown }).officerName ?? '')
      : null
    if (officerName) {
      return `Assigned to ${officerName}`
    }
  }

  if (action === 'REOPEN_GRIEVANCE' && metadata) {
    const reason = typeof metadata === 'object' && 'reason' in metadata
      ? String((metadata as { reason?: unknown }).reason ?? '')
      : null
    if (reason) {
      return `Reopened: ${reason}`
    }
  }

  if (action === 'FEEDBACK_SUBMITTED' && newValue) {
    const rating = typeof newValue === 'object' && 'rating' in newValue
      ? (newValue as { rating?: unknown }).rating
      : null
    if (rating) {
      return `Citizen rating: ${rating}/5 stars`
    }
  }

  return null
}

export function AuditTimeline({
  grievanceId,
  title = 'Audit trail',
  description = 'Immutable governance history of actions and state transitions recorded for this grievance.',
  className,
}: AuditTimelineProps) {
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const query = useAsync(() => services.audit.getByGrievance(grievanceId), [grievanceId])
  const logs: AuditLog[] = query.data ?? []

  const distinctActions = Array.from(new Set(logs.map((l) => l.action)))

  const filteredLogs = filterAction === 'ALL'
    ? logs
    : logs.filter((log) => log.action === filterAction)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="size-4 text-slate-400" aria-hidden="true" />
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>

          {distinctActions.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor={`audit-filter-${grievanceId}`} className="text-slate-500">
                Filter:
              </label>
              <select
                id={`audit-filter-${grievanceId}`}
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">All events ({logs.length})</option>
                {distinctActions.map((act) => (
                  <option key={act} value={act}>
                    {getActionMeta(act).label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : query.isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-center">
            <p className="text-sm text-red-700">
              {getErrorMessage(query.error)}
            </p>
            <button
              type="button"
              onClick={query.reload}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Retry loading audit logs
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              No audit records have been generated for this grievance yet.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-slate-200">
            <ul className="space-y-4">
              {filteredLogs.map((log) => {
                const meta = getActionMeta(log.action)
                const Icon = meta.icon
                const detail = formatValueChange(log)
                const actorName = log.user?.name ?? 'System'

                return (
                  <li key={log.id} className="relative group">
                    <div className="absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full border border-slate-300 bg-white ring-4 ring-white">
                      <Icon className="size-3 text-slate-600" aria-hidden="true" />
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors group-hover:bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                            meta.badgeClass,
                          )}
                        >
                          {meta.label}
                        </span>
                        <time
                          dateTime={log.createdAt}
                          className="text-xs font-normal text-slate-400"
                        >
                          {formatDateTime(log.createdAt)}
                        </time>
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Actor:</span>{' '}
                        <span>{actorName}</span>
                      </div>

                      {detail && (
                        <p className="mt-1.5 rounded-lg border border-slate-200/60 bg-white p-2 text-xs text-slate-700">
                          {detail}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
