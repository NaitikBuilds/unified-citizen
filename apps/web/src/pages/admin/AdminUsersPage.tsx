import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, UserRound, UsersRound } from 'lucide-react'
import type { UserRole } from '../../contracts/auth'
import { services } from '../../api/registry'
import { useAsync } from '../../hooks/useAsync'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { getErrorMessage } from '../../utils/errors'
import { ALL_ROLES, ROLE_LABELS } from '../../auth/roles'
import {
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
} from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'

const PAGE_SIZE = 10
const ROLE_VALUES = ALL_ROLES as UserRole[]

const ROLE_TONES: Record<UserRole, string> = {
  CITIZEN: 'bg-ucg-fog text-slate-600',
  OFFICER: 'bg-ucg-blue/10 text-ucg-blue',
  DEPARTMENT_ADMIN: 'bg-emerald-500/10 text-emerald-700',
  SUPER_ADMIN: 'bg-amber-500/10 text-amber-700',
}

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/60 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 rounded-lg lg:col-span-2" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ucg-fog bg-white">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-ucg-fog px-5 py-3.5 last:border-b-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Admin user management — Civic Command (V4.5c). Real user service. */
export function AdminUsersPage() {
  const { success: successToast, error: errorToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const role = useMemo(() => {
    const raw = searchParams.get('role') ?? ''
    return ROLE_VALUES.find((item) => item === raw) ?? null
  }, [searchParams])

  const departmentId = searchParams.get('departmentId') ?? ''
  const rawSearch = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(rawSearch, 300)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))

  const departmentsQuery = useAsync(() => services.department.list(), [])
  const usersQuery = useAsync(
    () =>
      services.user.listUsers({
        page,
        limit: PAGE_SIZE,
        ...(role ? { role } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      }),
    [page, role, departmentId, debouncedSearch],
  )

  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  async function handleUpdateUser(
    id: string,
    patch: { role?: UserRole; departmentId?: string | null },
  ) {
    if (updatingId) {
      return
    }
    setUpdatingId(id)
    try {
      await services.user.updateUser(id, patch)
      successToast({ title: 'User updated', description: 'The account changes have been saved.' })
      usersQuery.reload()
    } catch (updateError) {
      errorToast({ title: 'Could not update user', description: getErrorMessage(updateError) })
    } finally {
      setUpdatingId(null)
    }
  }

  const hasActiveFilters = role !== null || departmentId !== '' || rawSearch.trim() !== ''

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="ad-hero-overline flex items-center gap-2.5 text-slate-400">
          <span className="size-1.5 rounded-full bg-admin-indigo" aria-hidden="true" />
          Civic Command / Directory
        </p>
        <h1 className="mt-2 font-editorial text-3xl font-semibold tracking-tight text-ucg-ink">
          User management
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Every account on the platform — search, filter by role or department,
          and update roles and assignments.
        </p>
      </div>

      {/* Command bar */}
      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl border border-ucg-fog bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input
            label="Search"
            name="search"
            placeholder="Search by name or email"
            leftSlot={<Search className="size-4 text-slate-400" aria-hidden="true" />}
            value={rawSearch}
            onChange={(event) => {
              updateParams({ search: event.target.value, page: null })
            }}
            aria-label="Search users"
            labelClassName="gl-field-label"
            className="ucg-input-field"
          />
        </div>
        <Select
          label="Role"
          name="role-filter"
          placeholder="All roles"
          options={ROLE_VALUES.map((value) => ({
            value,
            label: ROLE_LABELS[value],
          }))}
          value={role ?? ''}
          onChange={(event) =>
            updateParams({ role: event.target.value, page: null })
          }
          aria-label="Filter by role"
          labelClassName="gl-field-label"
          className="ucg-input-field"
        />
        <Select
          label="Department"
          name="department-filter"
          placeholder="All departments"
          options={(departmentsQuery.data ?? []).map((department) => ({
            value: department.id,
            label: department.name,
          }))}
          value={departmentId}
          onChange={(event) =>
            updateParams({ departmentId: event.target.value, page: null })
          }
          aria-label="Filter by department"
          labelClassName="gl-field-label"
          className="ucg-input-field"
        />
      </div>

      {usersQuery.isLoading ? (
        <UsersSkeleton />
      ) : usersQuery.isError ? (
        <ErrorState
          title="Could not load users"
          message={getErrorMessage(usersQuery.error)}
          onRetry={usersQuery.reload}
        />
      ) : (usersQuery.data?.items.length ?? 0) === 0 ? (
        hasActiveFilters ? (
          <div className="rounded-2xl border border-ucg-fog bg-white p-4">
            <EmptyState
              icon={Search}
              title="No users match your filters"
              description="Try clearing the filters to see the full directory."
              action={
                <button
                  type="button"
                  onClick={() => setSearchParams({}, { replace: true })}
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
              icon={UsersRound}
              title="No users found"
              description="The directory is empty."
            />
          </div>
        )
      ) : (
        <>
          {usersQuery.data && (
            <p className="dp-meta mb-3">
              {hasActiveFilters ? 'Filters active' : 'All users'} ·{' '}
              {usersQuery.data.total} account{usersQuery.data.total === 1 ? '' : 's'} ·
              Page {usersQuery.data.page} of {usersQuery.data.totalPages}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-ucg-fog bg-white">
            <div className="ad-head">
              <span className="dp-meta">Name</span>
              <span className="dp-meta">Email</span>
              <span className="dp-meta">Role</span>
              <span className="dp-meta">Department</span>
              <span className="dp-meta">Phone</span>
              <span />
            </div>
            {usersQuery.data?.items.map((userItem) => (
              <div key={userItem.id} className="ad-table-row">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ucg-blue/10 text-ucg-blue">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-ucg-ink">{userItem.name}</span>
                </div>
                <span className="truncate text-sm text-slate-500">{userItem.email}</span>
                <span>
                  <Select
                    name="role"
                    aria-label={`Role for ${userItem.name}`}
                    options={ROLE_VALUES.map((value) => ({
                      value,
                      label: ROLE_LABELS[value],
                    }))}
                    value={userItem.role}
                    disabled={updatingId !== null}
                    onChange={(event) =>
                      handleUpdateUser(userItem.id, { role: event.target.value as UserRole })
                    }
                    className="ucg-input-field"
                  />
                </span>
                <span>
                  <Select
                    name="department"
                    aria-label={`Department for ${userItem.name}`}
                    placeholder="—"
                    options={(departmentsQuery.data ?? []).map((department) => ({
                      value: department.id,
                      label: department.name,
                    }))}
                    value={userItem.departmentId ?? ''}
                    disabled={updatingId !== null}
                    onChange={(event) =>
                      handleUpdateUser(userItem.id, { departmentId: event.target.value || null })
                    }
                    className="ucg-input-field"
                  />
                </span>
                <span className="truncate text-sm text-slate-500">{userItem.phone ?? '—'}</span>
                <span>
                  {updatingId === userItem.id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="size-3 animate-spin rounded-full border-2 border-ucg-blue border-t-transparent" aria-hidden="true" />
                      Saving
                    </span>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${ROLE_TONES[userItem.role]}`}>
                      {ROLE_LABELS[userItem.role]}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {usersQuery.data && (
            <Pagination
              page={usersQuery.data.page}
              totalPages={usersQuery.data.totalPages}
              total={usersQuery.data.total}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  )
}
