import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Grievance, GrievanceStatus } from '../../contracts/grievance'
import { formatDateTime } from '../../utils/format'
import { GRIEVANCE_STATUS_LABELS } from '../grievance'
import { cn } from '../../utils/cn'

type StepState = 'past' | 'current' | 'future'
type StepTone = 'default' | 'danger' | 'warning'

interface TimelineStep {
  key: string
  status: GrievanceStatus
  label: string
  state: StepState
  tone: StepTone
  /** Real timestamp from the grievance payload when one exists for this node. */
  timestamp?: string | null
  note: string
}

const BASE_CHAIN: Array<{ status: GrievanceStatus; note: string }> = [
  { status: 'SUBMITTED', note: 'Submitted by you with the details of the issue.' },
  { status: 'AI_CLASSIFIED', note: 'Classified by AI and routed towards the right department.' },
  { status: 'ASSIGNED', note: 'Assigned to an officer for action.' },
  { status: 'IN_PROGRESS', note: 'The assigned officer is working on the issue.' },
  { status: 'RESOLVED', note: 'Marked resolved by the department.' },
]

const SPECIAL_STATES: Record<
  string,
  { tone: StepTone; note: string }
> = {
  ESCALATED: { tone: 'danger', note: 'Raised to senior attention for urgent action.' },
  REJECTED: { tone: 'danger', note: 'Rejected during review by the department.' },
  REOPENED: { tone: 'warning', note: 'Reopened after resolution — back in progress.' },
}

/**
 * Builds the timeline steps from the grievance's actual state. Intermediate
 * transition times are NOT fabricated — only `createdAt` (submitted),
 * `resolvedAt` (resolved) and `updatedAt` (last update) come from the payload.
 */
function buildSteps(grievance: Grievance): TimelineStep[] {
  const chainIndex = BASE_CHAIN.findIndex((entry) => entry.status === grievance.status)
  const special = SPECIAL_STATES[grievance.status]

  const timestampFor = (status: GrievanceStatus): string | null | undefined => {
    if (status === 'SUBMITTED') {
      return grievance.createdAt
    }
    if (status === 'RESOLVED') {
      return grievance.resolvedAt
    }
    return undefined
  }

  if (chainIndex !== -1) {
    return BASE_CHAIN.map((entry, index) => ({
      key: entry.status,
      status: entry.status,
      label: GRIEVANCE_STATUS_LABELS[entry.status],
      state: index < chainIndex ? 'past' : index === chainIndex ? 'current' : 'future',
      tone: 'default',
      timestamp:
        index === chainIndex && index !== 0 && entry.status !== 'RESOLVED'
          ? grievance.updatedAt
          : timestampFor(entry.status),
      note: entry.note,
    }))
  }

  // Special terminal states — render the reached portion of the base chain
  // plus the special node as the current one.
  if (grievance.status === 'REOPENED') {
    return [
      ...BASE_CHAIN.map((entry) => ({
        key: entry.status,
        status: entry.status,
        label: GRIEVANCE_STATUS_LABELS[entry.status],
        state: 'past' as const,
        tone: 'default' as const,
        timestamp: timestampFor(entry.status),
        note: entry.note,
      })),
      {
        key: 'REOPENED',
        status: 'REOPENED' as const,
        label: GRIEVANCE_STATUS_LABELS.REOPENED,
        state: 'current' as const,
        tone: 'warning' as const,
        timestamp: grievance.updatedAt,
        note: special?.note ?? '',
      },
    ]
  }

  if (grievance.status === 'ESCALATED' || grievance.status === 'REJECTED') {
    const reached = grievance.status === 'ESCALATED' ? 3 : 1 // after IN_PROGRESS / during review
    return [
      ...BASE_CHAIN.slice(0, reached).map((entry) => ({
        key: entry.status,
        status: entry.status,
        label: GRIEVANCE_STATUS_LABELS[entry.status],
        state: 'past' as const,
        tone: 'default' as const,
        timestamp: timestampFor(entry.status),
        note: entry.note,
      })),
      {
        key: grievance.status,
        status: grievance.status,
        label: GRIEVANCE_STATUS_LABELS[grievance.status],
        state: 'current' as const,
        tone: special?.tone ?? 'default',
        timestamp: grievance.updatedAt,
        note: special?.note ?? '',
      },
    ]
  }

  return []
}

const toneDotClasses: Record<StepTone, string> = {
  default: 'bg-blue-600 ring-blue-600/25',
  danger: 'bg-red-600 ring-red-600/25',
  warning: 'bg-amber-500 ring-amber-500/25',
}

/**
 * Grievance lifecycle timeline (Member 4 — Step 93). On entry the connecting
 * line draws itself and nodes appear in sequence; the active node pulses.
 * Reduced motion renders the completed static timeline immediately. Clicking
 * a node reveals its timestamp (where known) and a plain-language note.
 */
export function GrievanceTimeline({ grievance }: { grievance: Grievance }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const steps = buildSteps(grievance)

  if (steps.length === 0) {
    return null
  }

  return (
    <ol aria-label="Grievance timeline" className="space-y-0">
      {steps.map((step, index) => {
        const isOpen = openKey === step.key
        const Icon = step.state === 'past' ? Check : undefined

        return (
          <li key={step.key} className="relative flex gap-3 pb-2 last:pb-0">
            {/* Node */}
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'timeline-node relative mt-0.5 flex size-5 items-center justify-center rounded-full ring-4',
                  step.state === 'past' && 'bg-emerald-500 text-white ring-emerald-500/20',
                  step.state === 'current' && cn('timeline-node-current text-white', toneDotClasses[step.tone]),
                  step.state === 'future' && 'border-2 border-slate-300 bg-white',
                )}
                aria-hidden="true"
              >
                {Icon && <Icon className="size-3" />}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    'timeline-segment w-0.5 flex-1 rounded-full',
                    step.state === 'past'
                      ? 'bg-emerald-400'
                      : step.state === 'current'
                        ? 'bg-slate-200'
                        : 'bg-slate-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div
              className="timeline-node-row min-w-0 flex-1 pb-4"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : step.key)}
                aria-expanded={isOpen}
                aria-current={step.state === 'current' ? 'step' : undefined}
                className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    step.state === 'future'
                      ? 'text-slate-400'
                      : step.state === 'current'
                        ? 'text-slate-900'
                        : 'text-slate-700',
                  )}
                >
                  {step.label}
                  {step.state === 'current' && (
                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      Current
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-slate-400 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs leading-relaxed text-slate-600">{step.note}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {step.timestamp
                      ? formatDateTime(step.timestamp)
                      : 'Time not recorded'}
                    {step.key === 'SUBMITTED' || step.key === 'RESOLVED'
                      ? ''
                      : step.state === 'current'
                        ? ' · last updated'
                        : ''}
                  </p>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
