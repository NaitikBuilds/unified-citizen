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

/** A single field-level validation error from the backend (Zod). */
export type ApiFieldError = {
  field: string
  message: string
}

/**
 * Wire-level error body emitted by the backend API.
 * Source of truth: apps/api middlewares (e.g. `{ success:false, error: "...", errors: [...] }`).
 */
export type ApiErrorBody = {
  error: string
  errors?: ApiFieldError[]
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