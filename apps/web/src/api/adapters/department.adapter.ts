import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../../contracts/department'
import type { DepartmentService } from '../services/department.service'
import { client } from '../client'

interface DepartmentsResponse {
  departments: Department[]
}

interface DepartmentResponse {
  department: Department
}

/**
 * REAL API department adapter (see apps/api/src/controllers/department.controller.ts).
 */
export const apiDepartmentService: DepartmentService = {
  async list(): Promise<Department[]> {
    const { data } = await client.get<DepartmentsResponse>('/departments')
    return data.departments
  },

  async getById(id: string): Promise<Department> {
    const { data } = await client.get<DepartmentResponse>(`/departments/${id}`)
    return data.department
  },

  async create(request: CreateDepartmentRequest): Promise<Department> {
    const { data } = await client.post<DepartmentResponse>('/departments', request)
    return data.department
  },

  async update(id: string, request: UpdateDepartmentRequest): Promise<Department> {
    const { data } = await client.patch<DepartmentResponse>(`/departments/${id}`, request)
    return data.department
  },

  async deactivate(id: string): Promise<Department> {
    const { data } = await client.delete<DepartmentResponse>(`/departments/${id}`)
    return data.department
  },
}
