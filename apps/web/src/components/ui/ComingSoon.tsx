import { Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { EmptyState } from './EmptyState'

export interface ComingSoonProps {
  title: string
  /** Which step implements this screen, e.g. "Phase 5 — Member 4 Step 87". */
  phase: string
  description?: string
}

export function ComingSoon({ title, phase, description }: ComingSoonProps) {
  return (
    <Card>
      <CardHeader>
        <p className="label-mono flex items-center gap-2 text-slate-400">
          <span className="size-1.5 rounded-full bg-ucg-blue" aria-hidden="true" />
          Unified Citizen / {title}
        </p>
        <CardTitle className="mt-1 font-editorial text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <p className="label-mono-sm text-slate-400">Implemented in {phase}.</p>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Construction}
          title={`${title} is on its way`}
          description={description ?? 'This screen is part of a later phase of the build.'}
        />
      </CardContent>
    </Card>
  )
}
