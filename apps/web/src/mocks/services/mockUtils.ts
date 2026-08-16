import type { Paginated } from '../../contracts/api'
import { ApiError } from '../../utils/errors'

/** Simulated network latency so loading states are exercised. */
export function simulateLatency(minMs = 200, maxMs = 600): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs)
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

/** Filters a list by a case-insensitive search term across the given fields. */
export function matchesSearch<T>(
  item: T,
  search: string | undefined,
  fields: Array<keyof T>,
): boolean {
  if (!search || search.trim() === '') {
    return true
  }
  const needle = search.trim().toLowerCase()
  return fields.some((field) => {
    const value = item[field]
    return typeof value === 'string' && value.toLowerCase().includes(needle)
  })
}

/** Slices an array into a Paginated<T> envelope. */
export function paginate<T>(items: T[], page = 1, limit = 10): Paginated<T> {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * limit
  return {
    items: items.slice(start, start + limit),
    page: safePage,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  }
}

/**
 * Failure simulation for exercising error states. Call `setMockFailure`
 * from a dev tool/console to make a specific mock method throw.
 * Key format: "<service>.<method>", e.g. "grievance.list", "ai.analyze".
 */
const failures = new Set<string>()

export function setMockFailure(key: string, enabled = true): void {
  if (enabled) {
    failures.add(key)
  } else {
    failures.delete(key)
  }
}

export function clearMockFailures(): void {
  failures.clear()
}

export function maybeFail(key: string): void {
  if (failures.has(key)) {
    throw new ApiError(
      `Simulated failure for ${key} (set via setMockFailure)`,
      500,
      'MOCK_FAILURE',
    )
  }
}
