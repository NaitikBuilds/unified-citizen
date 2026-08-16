import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { config } from '../config'
import { tokenStorage } from '../auth/tokenStorage'
import { ApiError, normalizeError } from '../utils/errors'

/** Dispatched on window when the session can no longer be refreshed. */
export const AUTH_EXPIRED_EVENT = 'ucg:auth-expired'

export function dispatchAuthExpired(): void {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

/** True for auth endpoints that must never trigger a refresh loop. */
function isAuthEndpoint(url?: string): boolean {
  if (!url) {
    return false
  }
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')
}

/**
 * Single shared API client. All services go through this instance so base
 * URL, headers, timeout, refresh handling, and error normalization stay
 * centralized (requirement: no per-component Axios instances).
 */
export const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the access token to every outgoing request.
client.interceptors.request.use((request) => {
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`
  }
  return request
})

// Single-flight refresh: concurrent 401s wait for one refresh call.
let isRefreshing = false
let waitingQueue: Array<(accessToken: string | null) => void> = []

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new ApiError('Your session has expired. Please sign in again.', 401, 'NO_REFRESH_TOKEN')
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      waitingQueue.push((accessToken) => {
        if (accessToken) {
          resolve(accessToken)
        } else {
          reject(new ApiError('Your session has expired. Please sign in again.', 401, 'REFRESH_FAILED'))
        }
      })
    })
  }

  isRefreshing = true
  try {
    // Use bare axios (not the client) to avoid interceptor recursion.
    const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
      `${config.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: config.apiTimeoutMs },
    )

    tokenStorage.setAccessToken(data.accessToken)
    if (data.refreshToken) {
      tokenStorage.setRefreshToken(data.refreshToken)
    }

    waitingQueue.forEach((resolve) => resolve(data.accessToken))
    return data.accessToken
  } catch (error) {
    tokenStorage.clear()
    dispatchAuthExpired()
    waitingQueue.forEach((resolve) => resolve(null))
    throw normalizeError(error)
  } finally {
    isRefreshing = false
    waitingQueue = []
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true
      const accessToken = await refreshAccessToken()
      original.headers.Authorization = `Bearer ${accessToken}`
      return client(original)
    }

    throw normalizeError(error)
  },
)
