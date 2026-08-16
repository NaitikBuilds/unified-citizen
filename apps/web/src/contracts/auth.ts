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

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

/** Wire shape returned by POST /auth/register. */
export type RegisterResponse = {
  message: string
  userId: string
}

/** Token pair returned by the backend auth endpoints. */
export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

/** Wire shape returned by POST /auth/login. */
export type LoginResponse = AuthTokens & {
  user: AuthUser
}

/** Wire shape returned by POST /auth/refresh. */
export type RefreshResponse = AuthTokens

export type LogoutRequest = {
  refreshToken?: string
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
  refreshToken?: string
}

/**
 * Request shapes for password recovery.
 *
 * BACKEND BLOCKER: the backend exposes no forgot-password or reset-password
 * endpoints (apps/api/src/routes/auth.routes.ts has register/login/refresh/
 * logout/me only). These types are documented so the UI can be wired in a
 * later phase when the backend supports them — do not build fake flows on top.
 */
export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  /** Token delivered to the user's email by the backend. */
  token: string
  password: string
}