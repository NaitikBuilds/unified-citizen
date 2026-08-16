export type Department = {
  id: string
  name: string
  code?: string
  description?: string
  isActive?: boolean
}

export type OfficerSummary = {
  id: string
  name: string
  email?: string
  departmentId: string
  isActive?: boolean
}