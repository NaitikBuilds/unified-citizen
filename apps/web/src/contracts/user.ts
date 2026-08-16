import type { UserRole } from './auth'

/**
 * Authenticated user profile. Mirrors the backend `User` model as exposed by
 * the API (`/auth/me`, `/users/me`). Backend currently persists `phone` but
 * only `name` is editable through the API.
 */
export type UserProfile = {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string | null
  phone?: string | null
  createdAt?: string
}

export type UpdateProfileRequest = {
  name?: string
}

export type AdminUpdateUserRequest = {
  role?: UserRole
  departmentId?: string | null
}
