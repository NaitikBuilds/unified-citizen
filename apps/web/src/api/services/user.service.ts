import type { Paginated } from '../../contracts/api'
import type { UserRole } from '../../contracts/auth'
import type {
  AdminUpdateUserRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../../contracts/user'

export type UserListParams = {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  departmentId?: string
}

export interface UserService {
  getProfile(): Promise<UserProfile>
  updateProfile(request: UpdateProfileRequest): Promise<UserProfile>

  /** Admin only (SUPER_ADMIN / DEPARTMENT_ADMIN). */
  listUsers(params?: UserListParams): Promise<Paginated<UserProfile>>
  getUserById(id: string): Promise<UserProfile>
  updateUser(id: string, request: AdminUpdateUserRequest): Promise<UserProfile>
}
