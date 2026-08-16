import type { Paginated } from '../../contracts/api'

/**
 * Wraps a backend array response in the frontend Paginated envelope.
 * The backend grievance/user/notification list endpoints return plain arrays
 * without pagination metadata; the UI contract is always paginated.
 */
export function toPaginated<T>(
  items: T[],
  page = 1,
  limit = Math.max(items.length, 1),
): Paginated<T> {
  return {
    items,
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  }
}

/** Converts a value that may be a Date instance into an ISO string. */
export function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}
