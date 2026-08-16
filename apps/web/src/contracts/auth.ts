export type UserRole =
  | 'CITIZEN'
  | 'OFFICER'
  | 'DEPARTMENT_ADMIN'
  | 'SUPER_ADMIN'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
}