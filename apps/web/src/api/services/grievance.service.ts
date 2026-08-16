import type { Paginated } from '../../contracts/api'
import type {
  Grievance,
  GrievanceStatus,
  Priority,
} from '../../contracts/grievance'

export type GrievanceFilters = {
  page?: number
  limit?: number
  search?: string
  status?: GrievanceStatus
  priority?: Priority
  category?: string
  officerId?: string
}

export interface GrievanceService {
  list(filters?: GrievanceFilters): Promise<Paginated<Grievance>>
  getById(id: string): Promise<Grievance>
}