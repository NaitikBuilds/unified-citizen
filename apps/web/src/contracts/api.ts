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