import type { AuthUser } from '../contracts/auth'

const ACCESS_TOKEN_KEY = 'ucg.accessToken'
const REFRESH_TOKEN_KEY = 'ucg.refreshToken'
const USER_KEY = 'ucg.user'

export type StoredTokens = {
  accessToken: string
  refreshToken?: string
}

/**
 * Persists session tokens and the authenticated user in localStorage.
 * Tokens are never logged and never sent outside the API client.
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) {
      return null
    }
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  },

  setAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  setTokens(tokens: StoredTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    }
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
