import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../../contracts/department'

export interface DepartmentService {
  list(): Promise<Department[]>
  getById(id: string): Promise<Department>

  /** Admin only (SUPER_ADMIN). */
  create(request: CreateDepartmentRequest): Promise<Department>
  update(id: string, request: UpdateDepartmentRequest): Promise<Department>
  /** Soft-deactivates a department (SUPER_ADMIN). */
  deactivate(id: string): Promise<Department>
}
