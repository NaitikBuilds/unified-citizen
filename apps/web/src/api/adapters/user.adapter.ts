import type { Paginated } from '../../contracts/api'
import type {
  AdminUpdateUserRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../../contracts/user'
import type {
  UserListParams,
  UserService,
} from '../services/user.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface UserResponse {
  user: UserProfile
}

interface UsersResponse {
  users: UserProfile[]
}

/**
 * REAL API user adapter (see apps/api/src/controllers/user.controller.ts).
 */
export const apiUserService: UserService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await client.get<UserResponse>('/users/me')
    return data.user
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const { data } = await client.patch<UserResponse>('/users/me', request)
    return data.user
  },

  async listUsers(params: UserListParams = {}): Promise<Paginated<UserProfile>> {
    const { data } = await client.get<UsersResponse>('/users', { params })
    return toPaginated(data.users, params.page, params.limit)
  },

  async getUserById(id: string): Promise<UserProfile> {
    const { data } = await client.get<UserResponse>(`/users/${id}`)
    return data.user
  },

  async updateUser(id: string, request: AdminUpdateUserRequest): Promise<UserProfile> {
    const { data } = await client.patch<UserResponse>(`/users/${id}`, request)
    return data.user
  },
}
