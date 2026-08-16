import { Building2 } from 'lucide-react'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { getErrorMessage } from '../../utils/errors'
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from '../../components/ui'

export function DepartmentsPage() {
  const { data, isLoading, isError, error, reload } = useAsync(() =>
    services.department.list(),
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Departments</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          The departments behind your city services
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Every grievance is routed to one of these departments and handled by a dedicated
          officer.
        </p>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white p-6">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3.5 w-full" />
                <Skeleton className="mt-2 h-3.5 w-4/5" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Could not load departments"
            message={getErrorMessage(error)}
            onRetry={reload}
          />
        ) : data && data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((department) => (
              <div key={department.id} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="size-5 text-blue-700" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-semibold text-slate-900">{department.name}</h2>
                {department.code && (
                  <p className="mt-1 font-mono text-xs text-slate-400">Code: {department.code}</p>
                )}
                {department.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {department.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No departments listed"
            description="Departments will appear here once they are published."
          />
        )}
      </div>
    </div>
  )
}
