import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search } from 'lucide-react'
import type { GrievanceStatus, Priority, SortDirection } from '../../contracts/grievance'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { getErrorMessage } from '../../utils/errors'
import {
  GRIEVANCE_STATUS_LABELS,
  GrievanceCard,
  PRIORITY_LABELS,
} from '../../components/grievance'
import {
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
  SkeletonCard,
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

function ListSkeleton() {
  return (
    <>
      <div className="mb-5 rounded-xl border border-slate-200/60 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 rounded-lg lg:col-span-2" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  )
}

/** My Grievances — Member 4, Step 91. */
export function GrievanceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state is URL-driven so dashboard metric clicks (and deep links)
  // pre-filter the list; every control writes back to the query string.
  const statuses = useMemo(() => {
    const raw = searchParams.getAll('status').flatMap((value) => value.split(','))
    return STATUS_VALUES.filter((status) => raw.includes(status))
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

  function toggleStatus(status: GrievanceStatus): void {
    const next = new URLSearchParams(searchParams)
    const current = new Set(next.getAll('status'))
    if (current.has(status)) {
      current.delete(status)
    } else {
      current.add(status)
    }
    next.delete('status')
    current.forEach((value) => next.append('status', value))
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const query = useAsync(
    () =>
      services.grievance.list({
        page,
        limit: PAGE_SIZE,
        ...(statuses.length > 0 ? { statuses } : {}),
        ...(priority ? { priority } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }),
    [page, statuses, priority, debouncedSearch, sort],
  )

  const hasActiveFilters =
    statuses.length > 0 || priority !== null || rawSearch.trim() !== ''

  function clearFilters(): void {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="dash-enter mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="gl-eyebrow">Civic Portal / Citizen</p>
          <h2 className="gl-title mt-1.5">My Grievances</h2>
          <p className="gl-subtitle mt-2">
            Search, filter and open every grievance you have reported — with live
            status and deadline tracking on each case.
          </p>
        </div>
        <Link
          to="/citizen/submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Report a grievance
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Filters — one cohesive command bar */}
      <div
        className="gl-command-bar dash-enter mb-5 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
        style={{ animationDelay: '60ms' }}
      >
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
          />
        </div>
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
        />
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
        />
      </div>

      {/* Status chips */}
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by status"
      >
        {STATUS_VALUES.map((status) => {
          const active = statuses.includes(status)
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              aria-pressed={active}
              className={active ? 'gl-chip gl-chip-active' : 'gl-chip'}
            >
              {GRIEVANCE_STATUS_LABELS[status]}
            </button>
          )
        })}
      </div>

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState
          title="Could not load your grievances"
          message={getErrorMessage(query.error)}
          onRetry={query.reload}
        />
      ) : (query.data?.items.length ?? 0) === 0 ? (
        hasActiveFilters ? (
          <div className="gl-empty dash-enter">
            <EmptyState
              icon={Search}
              title="No grievances match your filters"
              description="Try clearing the filters, or report a new grievance."
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
          <div className="gl-empty dash-enter">
            <EmptyState
              icon={ClipboardList}
              title="No grievances yet"
              description="When you report an issue it will appear here with live status tracking."
              action={
                <Link
                  to="/citizen/submit"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-ucg-blue px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Report your first grievance
                </Link>
              }
            />
          </div>
        )
      ) : (
        <div className="dash-enter" style={{ animationDelay: '120ms' }}>
          {query.data && (
            <div className="gl-readout mb-4">
              <span className={hasActiveFilters ? 'gl-readout-flag' : undefined}>
                {hasActiveFilters ? 'Filters active' : 'All grievances'}
              </span>
              <span>
                {query.data.total} results · Page {query.data.page} of{' '}
                {query.data.totalPages} · {PAGE_SIZE} per page
              </span>
            </div>
          )}

          <div className="gl-list">
            {query.data?.items.map((grievance) => (
              <Link
                key={grievance.id}
                to={`/citizen/grievances/${grievance.id}`}
                className="gl-row"
              >
                <GrievanceCard
                  grievance={grievance}
                  className="border-0 bg-transparent shadow-none"
                />
              </Link>
            ))}
          </div>

          {query.data && (
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
              className="gl-pagination mt-6"
            />
          )}
        </div>
      )}
    </div>
  )
}
