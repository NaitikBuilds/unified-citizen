import type { AxiosError } from 'axios'
import type { ApiErrorBody, ApiFieldError } from '../contracts/api'

/**
 * Normalized error surfaced by the API client and mock services.
 * Every service call rejects with an `ApiError` (or a subclass-safe plain
 * `Error` in unforeseen cases) so UI code can branch on `status`/`code`.
 */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string | null
  /** Field-level validation messages from the backend, keyed by field name. */
  readonly fieldErrors: Record<string, string> | null

  constructor(
    message: string,
    status: number | null = null,
    code: string | null = null,
    fieldErrors: Record<string, string> | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Normalizes a list of backend field errors (Zod style:
 * `[{ field: "body.email", message: "..." }]`) into a field-keyed map with the
 * `body.` prefix stripped.
 */
function mapFieldErrors(errors: unknown): Record<string, string> | null {
  if (!Array.isArray(errors)) {
    return null
  }
  const mapped: Record<string, string> = {}
  for (const entry of errors) {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      'field' in entry &&
      'message' in entry
    ) {
      const field = String((entry as ApiFieldError).field).replace(/^body\./, '')
      mapped[field] = String((entry as ApiFieldError).message)
    }
  }
  return Object.keys(mapped).length > 0 ? mapped : null
}

/**
 * Maps an unknown failure (Axios error, network failure, thrown string) to an
 * `ApiError` with a stable message. Never exposes tokens or raw bodies.
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorBody>

    const status = axiosError.response?.status ?? null
    const body = axiosError.response?.data

    if (body?.error) {
      return new ApiError(
        body.error,
        status,
        null,
        mapFieldErrors(body.errors),
      )
    }

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', status, axiosError.code)
    }

    if (!axiosError.response) {
      return new ApiError('Network error. Please check your connection and try again.', null, axiosError.code ?? null)
    }

    return new ApiError('Something went wrong. Please try again.', status)
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError('Something went wrong. Please try again.')
}

/** Short human label for HTTP status codes. */
export function httpStatusLabel(status: number): string {
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return "You don't have permission to perform this action."
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'This action conflicts with the current state of the record.'
    case 422:
      return 'The submitted information is invalid.'
    case 500:
    case 502:
    case 503:
      return 'The server encountered an error. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

/** User-friendly message for an error, falling back to a status label. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error) && error.message) {
    return error.message
  }
  if (isApiError(error) && error.status !== null) {
    return httpStatusLabel(error.status)
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
