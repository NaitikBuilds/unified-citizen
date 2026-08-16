import { ApiError } from '../../utils/errors'
import { tokenStorage } from '../../auth/tokenStorage'
import type {
  AuthSession,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  RegisterResponse,
} from '../../contracts/auth'
import type { UserProfile } from '../../contracts/user'
import type { AuthService } from '../../api/services/auth.service'
import { mockUsers, getMockUser } from '../data/users'
import { maybeFail, simulateLatency } from './mockUtils'

function mockAccessToken(userId: string): string {
  return `mock-access-token.${userId}.${Date.now()}`
}

function mockRefreshToken(userId: string): string {
  return `mock-refresh-token.${userId}.${Date.now()}`
}

/**
 * MOCK auth service. Persists tokens to the same tokenStorage used by the
 * real API adapter so the rest of the app is switch-agnostic. MOCK ONLY.
 */
export const mockAuthService: AuthService = {
  async login(request: LoginRequest): Promise<AuthSession> {
    maybeFail('auth.login')
    await simulateLatency()

    const user = mockUsers.find(
      (item) => item.email.toLowerCase() === request.email.trim().toLowerCase(),
    )

    if (!user || user.password !== request.password) {
      throw new ApiError('Invalid email or password', 401)
    }

    const session: AuthSession = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
      accessToken: mockAccessToken(user.id),
      refreshToken: mockRefreshToken(user.id),
    }

    tokenStorage.setTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })
    tokenStorage.setUser(session.user)

    return session
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    maybeFail('auth.register')
    await simulateLatency()

    const email = request.email.trim().toLowerCase()
    const exists = mockUsers.some((item) => item.email.toLowerCase() === email)

    if (exists) {
      throw new ApiError('An account with this email already exists', 409)
    }

    const user = {
      id: `user-citizen-mock-${Date.now()}`,
      name: request.name.trim(),
      email,
      role: 'CITIZEN' as const,
      departmentId: null,
      phone: null,
      password: request.password,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(user)

    return { message: 'User registered successfully', userId: user.id }
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    maybeFail('auth.refresh')
    await simulateLatency(100, 250)

    if (!refreshToken.startsWith('mock-refresh-token.')) {
      throw new ApiError('Invalid or expired refresh token', 401)
    }

    const userId = refreshToken.split('.')[1]
    const user = getMockUser(userId)

    if (!user) {
      throw new ApiError('Invalid or expired refresh token', 401)
    }

    const accessToken = mockAccessToken(userId)
    tokenStorage.setAccessToken(accessToken)

    return { accessToken }
  },

  async logout(request?: LogoutRequest): Promise<void> {
    maybeFail('auth.logout')
    await simulateLatency(100, 250)
    tokenStorage.clear()
    void request
  },

  async getMe(): Promise<UserProfile> {
    maybeFail('auth.getMe')
    await simulateLatency()

    const stored = tokenStorage.getStoredUser()
    if (!stored) {
      throw new ApiError('Unauthorized', 401)
    }

    const user = getMockUser(stored.id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      phone: user.phone,
      createdAt: user.createdAt,
    }
  },
}
