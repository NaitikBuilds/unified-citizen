import { useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import type { AiAnalysisResult } from '../../contracts/ai'
import type { Priority } from '../../contracts/grievance'
import { formatPercent } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

const PROCESSING_STAGES = [
  'Reading complaint',
  'Extracting signals',
  'Classifying category',
  'Routing to department',
  'Assigning priority',
]

export interface AIAnalysisCardProps {
  /** Result from the AI service; null while loading or when unavailable. */
  result: AiAnalysisResult | null
  isLoading: boolean
  onRetry?: () => void
  className?: string
}

function priorityVariant(priority: Priority | null | undefined): 'neutral' | 'warning' | 'danger' {
  if (priority === 'CRITICAL' || priority === 'HIGH') {
    return 'danger'
  }
  if (priority === 'MEDIUM') {
    return 'warning'
  }
  return 'neutral'
}

function ProcessingSequence() {
  return (
    <div className="space-y-2.5" role="status" aria-label="AI analysis in progress">
      {PROCESSING_STAGES.map((stage, index) => (
        <div
          key={stage}
          className="ai-stage-row flex items-center gap-3 text-sm text-slate-300"
          style={{ animationDelay: `${index * 0.18}s` }}
        >
          <span className="ai-stage-dot size-2 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
          <span>{stage}</span>
        </div>
      ))}
      <p className="pt-1 text-xs text-slate-500">
        Analysing your grievance with the classification model…
      </p>
    </div>
  )
}

/**
 * AI analysis display (Member 4 — Step 89). A contained digital-intelligence
 * panel: dark charcoal region with a dot-matrix accent, large confidence
 * value and a short staged processing sequence. Handles available,
 * low-confidence, unavailable and retry states — an AI failure never blocks
 * the grievance itself.
 */
export function AIAnalysisCard({
  result,
  isLoading,
  onRetry,
  className,
}: AIAnalysisCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  if (isLoading) {
    return (
      <section
        aria-label="AI analysis"
        className={cn(
          'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5',
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <BrainCircuit className="size-4 text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              AI Analysis
            </h3>
          </div>
          <ProcessingSequence />
        </div>
      </section>
    )
  }

  if (!result || result.availability === 'unavailable' || result.availability === 'timeout') {
    return (
      <section
        aria-label="AI analysis"
        className={cn(
          'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
            <AlertTriangle className="size-4.5 text-amber-400" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200">AI analysis unavailable</h3>
            <p className="mt-1 text-sm text-slate-400">
              The AI service did not respond{result?.availability === 'timeout' ? ' in time' : ''}.
              Your grievance is still safe and will be reviewed by our team.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  const classification = result.classification
  if (!classification) {
    return null
  }

  const confidence = classification.confidence ?? 0
  const lowConfidence = result.availability === 'low_confidence'

  return (
    <section
      aria-label="AI analysis"
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              AI Analysis
            </h3>
          </div>
          {classification.modelName && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {classification.modelName} v{classification.modelVersion}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Suggested category</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {classification.category ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-400">{classification.department ?? 'Department pending'}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">Confidence</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-blue-400">
              {formatPercent(confidence)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={priorityVariant(classification.priority)}>
            {classification.priority ?? 'Priority pending'}
          </Badge>
          {lowConfidence && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-500/30">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Human review recommended
            </span>
          )}
          {confidence >= 0.5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              High confidence
            </span>
          )}
        </div>

        {classification.summary && (
          <p className="mt-4 border-t border-slate-800 pt-3 text-sm leading-relaxed text-slate-300">
            {classification.summary}
          </p>
        )}

        {classification.explanation && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowExplanation((open) => !open)}
              aria-expanded={showExplanation}
              className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              How was this decided?
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  showExplanation && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>
            {showExplanation && (
              <p className="mt-2 rounded-lg bg-slate-800/70 p-3 text-xs leading-relaxed text-slate-400">
                {classification.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
