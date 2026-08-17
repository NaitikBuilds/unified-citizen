import { Building2 } from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from '../../components/ui'
import {
  CivicPanel,
  PageHero,
  PublicPage,
  Reveal,
} from '../../components/public'

/**
 * Departments directory. The data flow (services.department.list() via
 * useAsync with loading/error/retry/empty states) is unchanged — only the
 * presentation moved onto the shared civic page system.
 */
export function DepartmentsPage() {
  const { data, isLoading, isError, error, reload } = useAsync(() =>
    services.department.list(),
  )

  return (
    <PublicPage>
      <PageHero
        eyebrow="Departments"
        title="The departments behind your city services"
        description="Every grievance is routed to one of these departments and handled by a dedicated officer."
        meta="CIVIC SERVICES REGISTRY"
      />

      <section className="pb-20">
        {isLoading ? (
          <>
            <p className="civic-mono-label mb-6">SYSTEM DIRECTORY — LOADING</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="civic-panel p-6">
                  <Skeleton className="size-10 rounded-xl" />
                  <Skeleton className="mt-5 h-5 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-20" />
                  <Skeleton className="mt-4 h-3.5 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-4/5" />
                </div>
              ))}
            </div>
          </>
        ) : isError ? (
          <CivicPanel className="max-w-2xl">
            <ErrorState
              title="Could not load departments"
              message={getErrorMessage(error)}
              onRetry={reload}
            />
          </CivicPanel>
        ) : data && data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((department, index) => (
              <Reveal key={department.id} delay={index * 50}>
                <CivicPanel hover className="h-full">
                  <div className="flex items-start justify-between">
                    <span className="civic-icon-chip">
                      <Building2 aria-hidden="true" />
                    </span>
                    {department.code && (
                      <span className="civic-mono-label">{department.code}</span>
                    )}
                  </div>
                  <h2 className="mt-5 font-editorial text-xl font-semibold text-ucg-ink">
                    {department.name}
                  </h2>
                  {department.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {department.description}
                    </p>
                  )}
                </CivicPanel>
              </Reveal>
            ))}
          </div>
        ) : (
          <CivicPanel className="max-w-2xl">
            <EmptyState
              title="No departments listed"
              description="Departments will appear here once they are published."
            />
          </CivicPanel>
        )}
      </section>
    </PublicPage>
  )
}
