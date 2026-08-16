import { ApiError } from '../../utils/errors'
import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../../contracts/department'
import type { DepartmentService } from '../../api/services/department.service'
import { mockDepartments } from '../data/departments'
import { maybeFail, simulateLatency } from './mockUtils'

/**
 * MOCK department service. MOCK ONLY.
 */
export const mockDepartmentService: DepartmentService = {
  async list(): Promise<Department[]> {
    maybeFail('department.list')
    await simulateLatency()
    return mockDepartments
      .filter((department) => department.isActive !== false)
      .map((department) => ({ ...department }))
  },

  async getById(id: string): Promise<Department> {
    maybeFail('department.getById')
    await simulateLatency()
    const department = mockDepartments.find(
      (item) => item.id === id && item.isActive !== false,
    )
    if (!department) {
      throw new ApiError('Department not found', 404)
    }
    return { ...department }
  },

  async create(request: CreateDepartmentRequest): Promise<Department> {
    maybeFail('department.create')
    await simulateLatency()

    const exists = mockDepartments.some(
      (item) => item.name.toLowerCase() === request.name.trim().toLowerCase(),
    )
    if (exists) {
      throw new ApiError('A department with this name already exists', 409)
    }

    const department: Department = {
      id: `dept-mock-${Date.now()}`,
      name: request.name.trim(),
      code: request.code ?? request.name.slice(0, 3).toUpperCase(),
      description: request.description,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    mockDepartments.push(department)
    return { ...department }
  },

  async update(id: string, request: UpdateDepartmentRequest): Promise<Department> {
    maybeFail('department.update')
    await simulateLatency()

    const index = mockDepartments.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Department not found', 404)
    }

    mockDepartments[index] = {
      ...mockDepartments[index],
      ...(request.name ? { name: request.name } : {}),
      ...(request.description !== undefined
        ? { description: request.description }
        : {}),
    }

    return { ...mockDepartments[index] }
  },

  async deactivate(id: string): Promise<Department> {
    maybeFail('department.deactivate')
    await simulateLatency()

    const index = mockDepartments.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Department not found', 404)
    }
    if (mockDepartments[index].isActive === false) {
      throw new ApiError('Department is already inactive', 400)
    }

    mockDepartments[index] = {
      ...mockDepartments[index],
      isActive: false,
    }

    return { ...mockDepartments[index] }
  },
}
