import { createContext, useContext } from 'react'
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../contracts/auth'

export interface AuthContextValue {
  /** Authenticated user, or null when signed out. */
  user: AuthUser | null
  isAuthenticated: boolean
  /** True while the session is being restored from storage on first load. */
  isLoading: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  /** Explicitly rotates the access token using the stored refresh token. */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
