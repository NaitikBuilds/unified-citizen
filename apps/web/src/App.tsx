import { Landmark, ShieldCheck } from 'lucide-react'
import { config } from './config'
import { services } from './api/registry'
import { useAsync } from './hooks/useAsync'
import { getErrorMessage } from './utils/errors'
import { useToast } from './components/ui'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardSection,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
} from './components/ui'
import { PriorityBadge, StatusBadge } from './components/grievance'

/**
 * Phase 0 foundation smoke screen. Exercises the shared UI kit, state
 * components, hooks, and the service registry (mock or real API). Portal
 * screens arrive in later phases.
 */
function App() {
  const toast = useToast()

  const { data, isLoading, isError, error, reload } = useAsync(() =>
    services.grievance.list({ limit: 3 }),
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600">
            <Landmark className="size-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Unified Citizen Governance
            </h1>
            <p className="text-xs text-slate-500">
              Shared frontend foundation — Phase 0
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={config.useMockApi ? 'warning' : 'success'}>
              {config.useMockApi ? 'MOCK' : 'REAL API'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* Service registry smoke test */}
        <CardSection
          title="Service registry"
          description={
            config.useMockApi
              ? 'VITE_USE_MOCK_API=true — data comes from in-memory mock services (MOCK).'
              : 'VITE_USE_MOCK_API=false — data comes from the backend API (REAL API).'
          }
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              Reload
            </Button>
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={reload} />
          ) : data && data.items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {data.items.map((grievance) => (
                <li
                  key={grievance.id}
                  className="flex flex-wrap items-center gap-2 py-3"
                >
                  <span className="font-mono text-xs text-slate-400">
                    {grievance.ticketId}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    {grievance.title}
                  </span>
                  <StatusBadge status={grievance.status} />
                  <PriorityBadge priority={grievance.priority} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No grievances yet" />
          )}
        </CardSection>

        {/* UI kit */}
        <Card>
          <CardHeader>
            <CardTitle>Shared UI kit</CardTitle>
            <CardDescription>
              Reusable components used by every portal — no per-portal duplication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button isLoading>Loading</Button>
              <Button
                variant="outline"
                onClick={() => toast.success({ title: 'Toast works', description: 'The shared toast system is ready.' })}
              >
                Show toast
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>Neutral</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="purple">Purple</Badge>
            </div>
          </CardContent>
        </Card>

        {/* State components */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardSection title="Empty state" description="Shown when a list has no data.">
            <EmptyState
              title="No notifications"
              description="When you receive notifications they will appear here."
            />
          </CardSection>
          <CardSection title="Loading states" description="Skeletons replace content while data loads.">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardSection>
        </div>

        <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Frontend role guards control navigation and UX only — the backend remains the
          security authority.
        </p>
      </main>
    </div>
  )
}

export default App