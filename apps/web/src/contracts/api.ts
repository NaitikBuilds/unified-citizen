export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type Paginated<T> = {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Wire-level error body emitted by the backend API.
 * Source of truth: apps/api controllers (e.g. `{ error: "..." }`).
 */
export type ApiErrorBody = {
  error: string
  errors?: Record<string, string[]>
}

/** Common list request parameters shared by list endpoints. */
export type ApiListParams = {
  page?: number
  limit?: number
  search?: string
}

export const DEFAULT_PAGE_SIZE = 10

export const PAGE_SIZES = [10, 25, 50] as const

export type PageSize = (typeof PAGE_SIZES)[number]