import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>Implemented in {phase}.</CardDescription>
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
