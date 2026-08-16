import { Link } from 'react-router-dom'
import { ArrowRight, Copy } from 'lucide-react'
import type { DuplicateMatch } from '../../contracts/ai'
import { formatDate, formatPercent } from '../../utils/format'
import { StatusBadge } from '../grievance'
import { cn } from '../../utils/cn'

export interface DuplicateWarningProps {
  matches: DuplicateMatch[]
  className?: string
}

/**
 * Possible-duplicate review warning (Member 4 — Step 90). This is a warning
 * and review experience only — the citizen's grievance is never automatically
 * rejected or deleted from the frontend. Subtle pulsing outline, restrained
 * civic treatment (no flashing), disabled under reduced motion.
 */
export function DuplicateWarning({ matches, className }: DuplicateWarningProps) {
  if (matches.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Possible duplicate grievance"
      className={cn(
        'duplicate-warning relative rounded-xl border border-amber-400/60 bg-amber-50/90 p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <Copy className="size-4.5 text-amber-700" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-amber-900">
            Possible duplicate grievance found
          </h3>
          <p className="mt-0.5 text-xs text-amber-700">
            Your report looks similar to existing grievance(s). This does not
            block your submission — it will be reviewed and merged if needed.
          </p>

          <ul className="mt-3 space-y-2">
            {matches.map((match) => (
              <li
                key={match.grievanceId}
                className="rounded-lg border border-amber-200 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium text-slate-500">
                    {match.ticketId}
                  </span>
                  <StatusBadge status={match.status} />
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    {formatPercent(match.score)} similar
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-800">{match.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Reported {formatDate(match.createdAt)}
                </p>
                <Link
                  to={`/citizen/grievances/${match.grievanceId}`}
                  className="mt-2 inline-flex items-center gap-1 rounded-md text-xs font-semibold text-amber-800 transition-colors hover:text-amber-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  View existing grievance
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
