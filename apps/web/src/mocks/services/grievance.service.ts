import type { Paginated } from '../../contracts/api'
import type { Grievance } from '../../contracts/grievance'
import {
  type GrievanceFilters,
  type GrievanceService,
} from '../../api/services/grievance.service'
import { mockGrievances } from '../data/grievances'

export const mockGrievanceService: GrievanceService = {
  async list(
    filters: GrievanceFilters = {},
  ): Promise<Paginated<Grievance>> {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10

    let results = [...mockGrievances]

    if (filters.status) {
      results = results.filter(
        (grievance) => grievance.status === filters.status,
      )
    }

    if (filters.priority) {
      results = results.filter(
        (grievance) => grievance.priority === filters.priority,
      )
    }

    if (filters.category) {
      results = results.filter(
        (grievance) => grievance.category === filters.category,
      )
    }

    if (filters.officerId) {
      results = results.filter(
        (grievance) =>
          grievance.assignedOfficer?.id === filters.officerId,
      )
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()

      results = results.filter(
        (grievance) =>
          grievance.id.toLowerCase().includes(search) ||
          grievance.title.toLowerCase().includes(search) ||
          grievance.description.toLowerCase().includes(search),
      )
    }

    const total = results.length
    const start = (page - 1) * limit

    return {
      items: results.slice(start, start + limit),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  },

  async getById(id: string): Promise<Grievance> {
    const grievance = mockGrievances.find(
      (item) => item.id === id,
    )

    if (!grievance) {
      throw new Error('Grievance not found')
    }

    return grievance
  },
}