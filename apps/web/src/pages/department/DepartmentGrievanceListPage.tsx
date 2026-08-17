import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Inbox, Search } from 'lucide-react'
import type {
  GrievanceStatus,
  Priority,
  SortDirection,
} from '../../contracts/grievance'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../auth/auth-context'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { getErrorMessage } from '../../utils/errors'
import {
  GRIEVANCE_STATUS_LABELS,
  PRIORITY_LABELS,
  PriorityBadge,
  StatusBadge,
} from '../../components/grievance'
import {
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
} from '../../components/ui'

const STATUS_VALUES = Object.keys(GRIEVANCE_STATUS_LABELS) as GrievanceStatus[]
const PRIORITY_VALUES = Object.keys(PRIORITY_LABELS) as Priority[]
const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'priority:desc', label: 'Priority: high to low' },
  { value: 'priority:asc', label: 'Priority: low to high' },
  { value: 'status:asc', label: 'Status: earliest stage' },
  { value: 'status:desc', label: 'Status: latest stage' },
]

function parseSort(sort: string | null): { sortBy: 'createdAt' | 'priority' | 'status'; sortDir: SortDirection } {
  const [sortBy, sortDir] = (sort ?? 'createdAt:desc').split(':')
  if (sortBy === 'priority' || sortBy === 'status') {
    return { sortBy, sortDir: sortDir === 'asc' ? 'asc' : 'desc' }
  }
  return { sortBy: 'createdAt', sortDir: sortDir === 'asc' ? 'asc' : 'desc' }
}

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/60 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 rounded-lg lg:col-span-2" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-ucg-fog bg-white">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-ucg-fog px-4 py-3.5 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Department grievance queue — Civic Duty (V4.5b). */
export function DepartmentGrievanceListPage() {
  const { user } = useAuth()
  const departmentId = user?.departmentId ?? null

  const [searchParams, setSearchParams] = useSearchParams()

  const status = useMemo(() => {
    const raw = searchParams.get('status') ?? ''
    return STATUS_VALUES.find((item) => item === raw) ?? null
  }, [searchParams])

  const priority = useMemo(() => {
    const raw = searchParams.get('priority') ?? ''
    return PRIORITY_VALUES.find((item) => item === raw) ?? null
  }, [searchParams])

  const rawSearch = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(rawSearch, 300)

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams])

  function updateParams(patch: Record<string, string | null>): void {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })
    setSearchParams(next, { replace: true })
  }

  const query = useAsync(
    () =>
      services.grievance.list({
        page,
        limit: PAGE_SIZE,
        departmentId: departmentId ?? undefined,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }),
    [page, status, priority, debouncedSearch, sort, departmentId],
  )

  const hasActiveFilters =
    status !== null || priority !== null || rawSearch.trim() !== ''

  function clearFilters(): void {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dp-hero-overline flex items-center gap-2.5 text-slate-400">
            <span className="size-1.5 rounded-full bg-ucg-blue" aria-hidden="true" />
            Civic Duty / Queue
          </p>
          <h1 className="mt-2 font-editorial text-3xl font-semibold tracking-tight text-ucg-ink">
            Grievance queue
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Every grievance assigned to your department — search, filter and act
            on each case.
          </p>
        </div>
      </div>

      {/* Command bar */}
      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl border border-ucg-fog bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input
            label="Search"
            name="search"
            placeholder="Search by title, ticket or location"
            leftSlot={<Search className="size-4 text-slate-400" aria-hidden="true" />}
            value={rawSearch}
            onChange={(event) => {
              updateParams({ search: event.target.value, page: null })
            }}
            aria-label="Search grievances"
            labelClassName="gl-field-label"
            className="ucg-input-field"
          />
        </div>
        <Select
          label="Status"
          name="status-filter"
          placeholder="All statuses"
          options={STATUS_VALUES.map((value) => ({
            value,
            label: GRIEVANCE_STATUS_LABELS[value],
          }))}
          value={status ?? ''}
          onChange={(event) =>
            updateParams({ status: event.target.value, page: null })
          }
          aria-label="Filter by status"
          labelClassName="gl-field-label"
          className="ucg-input-field"
        />
        <Select
          label="Priority"
          name="priority-filter"
          placeholder="All priorities"
          options={PRIORITY_VALUES.map((value) => ({
            value,
            label: PRIORITY_LABELS[value],
          }))}
          value={priority ?? ''}
          onChange={(event) =>
            updateParams({ priority: event.target.value, page: null })
          }
          aria-label="Filter by priority"
          labelClassName="gl-field-label"
          className="ucg-input-field"
        />
      </div>

      <div className="mb-5">
        <Select
          label="Sort"
          name="sort"
          options={SORT_OPTIONS}
          value={`${sort.sortBy}:${sort.sortDir}`}
          onChange={(event) =>
            updateParams({ sort: event.target.value, page: null })
          }
          aria-label="Sort grievances"
          labelClassName="gl-field-label"
          className="ucg-input-field w-full sm:w-64"
        />
      </div>

      {query.isLoading ? (
        <QueueSkeleton />
      ) : query.isError ? (
        <ErrorState
          title="Could not load the grievance queue"
          message={getErrorMessage(query.error)}
          onRetry={query.reload}
        />
      ) : (query.data?.items.length ?? 0) === 0 ? (
        hasActiveFilters ? (
          <div className="rounded-2xl border border-ucg-fog bg-white p-4">
            <EmptyState
              icon={Search}
              title="No grievances match your filters"
              description="Try clearing the filters to see the full queue."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-ucg-fog bg-white p-4">
            <EmptyState
              icon={Inbox}
              title="No grievances yet"
              description="Grievances routed to this department will appear here."
            />
          </div>
        )
      ) : (
        <>
          {query.data && (
            <p className="dp-meta mb-3">
              {hasActiveFilters ? 'Filters active' : 'All grievances'} ·{' '}
              {query.data.total} result{query.data.total === 1 ? '' : 's'} · Page{' '}
              {query.data.page} of {query.data.totalPages} · {PAGE_SIZE} per page
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-ucg-fog bg-white">
            {query.data?.items.map((grievance) => (
              <Link
                key={grievance.id}
                to={`/department/grievances/${grievance.id}`}
                className="group flex items-center gap-4 border-b border-ucg-fog px-4 py-3 transition-colors last:border-b-0 hover:bg-ucg-blue/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="dp-ticket">{grievance.ticketId}</span>
                    <span className="dp-meta text-[#8a93a0]">
                      {grievance.citizen?.name ?? 'Unknown citizen'}
                    </span>
                  </div>
                  <p className="dp-row-title mt-1 truncate group-hover:text-ucg-blue">
                    {grievance.title}
                  </p>
                  <p className="dp-meta mt-1">
                    {grievance.assignedOfficer
                      ? `Officer: ${grievance.assignedOfficer.name}`
                      : 'Unassigned'}
                  </p>
                </div>
                <span className="hidden shrink-0 sm:block">
                  <StatusBadge status={grievance.status} />
                </span>
                <span className="shrink-0">
                  <PriorityBadge priority={grievance.priority} />
                </span>
                <ArrowRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-ucg-blue" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {query.data && (
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  )
}
