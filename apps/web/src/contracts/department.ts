export type Department = {
  id: string
  name: string
  code?: string
  description?: string
  isActive?: boolean
  createdAt?: string
}

export type CreateDepartmentRequest = {
  name: string
  code?: string
  description?: string
}

export type UpdateDepartmentRequest = {
  name?: string
  description?: string
}

export type OfficerSummary = {
  id: string
  name: string
  email?: string
  departmentId: string
  isActive?: boolean
}