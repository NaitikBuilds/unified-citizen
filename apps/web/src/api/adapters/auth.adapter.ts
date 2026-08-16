import type { AuthUser } from '../../contracts/auth'
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../contracts/auth'
import type { UserProfile } from '../../contracts/user'
import type { AuthService } from '../services/auth.service'
import { client } from '../client'
import { tokenStorage } from '../../auth/tokenStorage'

interface AuthMeResponse {
  user: UserProfile
}

/**
 * REAL API auth adapter. Maps the backend auth wire shapes
 * (see apps/api/src/controllers/auth.controller.ts) to domain contracts and
 * persists the session to tokenStorage so the API client can authenticate.
 */
export const apiAuthService: AuthService = {
  async login(request: LoginRequest) {
    const { data } = await client.post<LoginResponse>('/auth/login', request)

    tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })
    tokenStorage.setUser(data.user)

    return {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await client.post<RegisterResponse>('/auth/register', request)
    return data
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await client.post<RefreshResponse>('/auth/refresh', { refreshToken })

    // Persist so subsequent requests carry the new access token. (The client
    // interceptor does the same on automatic refresh; this covers explicit calls.)
    tokenStorage.setAccessToken(data.accessToken)
    if (data.refreshToken) {
      tokenStorage.setRefreshToken(data.refreshToken)
    }

    return data
  },

  async logout(request?: LogoutRequest): Promise<void> {
    try {
      await client.post('/auth/logout', {
        refreshToken: request?.refreshToken ?? tokenStorage.getRefreshToken(),
      })
    } finally {
      tokenStorage.clear()
    }
  },

  async getMe(): Promise<UserProfile> {
    const { data } = await client.get<AuthMeResponse>('/auth/me')
    const profile = data.user
    const sessionUser: AuthUser = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      departmentId: profile.departmentId,
    }
    tokenStorage.setUser(sessionUser)
    return profile
  },
}
