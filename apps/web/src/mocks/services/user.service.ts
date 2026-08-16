import type { Paginated } from '../../contracts/api'
import type {
  AdminUpdateUserRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../../contracts/user'
import type {
  UserListParams,
  UserService,
} from '../../api/services/user.service'
import { tokenStorage } from '../../auth/tokenStorage'
import { ApiError } from '../../utils/errors'
import { mockUsers } from '../data/users'
import { matchesSearch, maybeFail, paginate, simulateLatency } from './mockUtils'

function toProfile(user: (typeof mockUsers)[number]): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    phone: user.phone,
    createdAt: user.createdAt,
  }
}

/**
 * MOCK user service. MOCK ONLY.
 */
export const mockUserService: UserService = {
  async getProfile(): Promise<UserProfile> {
    maybeFail('user.getProfile')
    await simulateLatency()

    const stored = tokenStorage.getStoredUser()
    if (!stored) {
      throw new ApiError('Unauthorized', 401)
    }
    const user = mockUsers.find((item) => item.id === stored.id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }
    return toProfile(user)
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    maybeFail('user.updateProfile')
    await simulateLatency()

    const stored = tokenStorage.getStoredUser()
    if (!stored) {
      throw new ApiError('Unauthorized', 401)
    }

    const index = mockUsers.findIndex((item) => item.id === stored.id)
    if (index === -1) {
      throw new ApiError('User not found', 404)
    }

    if (request.name) {
      mockUsers[index] = { ...mockUsers[index], name: request.name.trim() }
      tokenStorage.setUser({
        id: mockUsers[index].id,
        name: mockUsers[index].name,
        email: mockUsers[index].email,
        role: mockUsers[index].role,
        departmentId: mockUsers[index].departmentId,
      })
    }

    return toProfile(mockUsers[index])
  },

  async listUsers(params: UserListParams = {}): Promise<Paginated<UserProfile>> {
    maybeFail('user.listUsers')
    await simulateLatency()

    const page = params.page ?? 1
    const limit = params.limit ?? 10

    let results = mockUsers.filter(
      (user) => !params.role || user.role === params.role,
    )

    if (params.departmentId) {
      results = results.filter((user) => user.departmentId === params.departmentId)
    }

    if (params.search) {
      results = results.filter((user) =>
        matchesSearch(user, params.search, ['name', 'email']),
      )
    }

    return paginate(results.map(toProfile), page, limit)
  },

  async getUserById(id: string): Promise<UserProfile> {
    maybeFail('user.getUserById')
    await simulateLatency()

    const user = mockUsers.find((item) => item.id === id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }
    return toProfile(user)
  },

  async updateUser(id: string, request: AdminUpdateUserRequest): Promise<UserProfile> {
    maybeFail('user.updateUser')
    await simulateLatency()

    const index = mockUsers.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('User not found', 404)
    }

    mockUsers[index] = {
      ...mockUsers[index],
      ...(request.role ? { role: request.role } : {}),
      ...(request.departmentId !== undefined
        ? { departmentId: request.departmentId }
        : {}),
    }

    return toProfile(mockUsers[index])
  },
}
