import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginRequest, RegisterRequest } from '../contracts/auth'
import { services } from '../api/registry'
import { tokenStorage } from './tokenStorage'
import { AUTH_EXPIRED_EVENT } from '../api/client'
import { AuthContext, type AuthContextValue } from './auth-context'
import { ApiError } from '../utils/errors'

function toAuthUser(user: {
  id: string
  name: string
  email: string
  role: AuthUser['role']
  departmentId?: string | null
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  }
}

/**
 * Single shared authentication provider for all portals. Owns the session
 * state (user + persisted tokens) and exposes login/logout/refresh. Restores
 * the session from tokenStorage on mount and re-validates it against the
 * server (`/auth/me`); listens for AUTH_EXPIRED_EVENT fired by the API client
 * when a refresh fails.
 *
 * Frontend guards built on this provider only control navigation and visible
 * actions — the backend remains the security authority.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from storage, then re-validate with the server.
  useEffect(() => {
    let cancelled = false

    async function restoreSession(): Promise<void> {
      const storedUser = tokenStorage.getStoredUser()
      const hasToken = Boolean(tokenStorage.getAccessToken())

      if (!storedUser || !hasToken) {
        setIsLoading(false)
        return
      }

      setUser(storedUser)

      try {
        const profile = await services.auth.getMe()
        if (!cancelled) {
          setUser(toAuthUser(profile))
        }
      } catch {
        // The API client already attempted a token refresh. If it failed it
        // dispatched AUTH_EXPIRED_EVENT, which clears the session below.
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    const handleSessionExpired = (): void => {
      setUser(null)
      setIsLoading(false)
    }

    void restoreSession()
    window.addEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      cancelled = true
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const session = await services.auth.login(request)
    setUser(session.user)
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    await services.auth.register(request)
  }, [])

  const logout = useCallback(async () => {
    try {
      await services.auth.logout()
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      throw new ApiError('Your session has expired. Please sign in again.', 401)
    }
    await services.auth.refresh(refreshToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
