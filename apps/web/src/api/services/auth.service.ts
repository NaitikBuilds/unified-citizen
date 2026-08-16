import type {
  AuthSession,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from '../../contracts/auth'
import type { UserProfile } from '../../contracts/user'

export interface AuthService {
  /** Authenticates and returns a session; tokens are persisted by the adapter. */
  login(request: LoginRequest): Promise<AuthSession>
  register(request: RegisterRequest): Promise<RegisterResponse>
  refresh(refreshToken: string): Promise<RefreshResponse>
  logout(request?: LogoutRequest): Promise<void>
  /** Returns the authenticated user from the server (session is source of truth). */
  getMe(): Promise<UserProfile>
}
