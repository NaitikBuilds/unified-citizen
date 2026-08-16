import type { Paginated } from '../../contracts/api'
import type { Attachment } from '../../contracts/attachment'
import type { Comment, CreateCommentRequest } from '../../contracts/comment'
import type {
  CreateFeedbackRequest,
  Feedback,
} from '../../contracts/feedback'
import type {
  AssignGrievanceRequest,
  CreateGrievanceRequest,
  Grievance,
  GrievanceStatus,
  Priority,
  UpdateGrievanceRequest,
  UpdateGrievanceStatusRequest,
} from '../../contracts/grievance'
import type {
  GrievanceFilters,
  GrievanceService,
} from '../services/grievance.service'
import { client } from '../client'
import { toPaginated } from './mapper'

interface GrievancesResponse {
  grievances: Grievance[]
}

interface GrievanceResponse {
  grievance: Grievance
}

interface CommentsResponse {
  comments: Comment[]
}

interface AttachmentsResponse {
  attachments: Attachment[]
}

interface FeedbackResponse {
  feedback: Feedback
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

const STATUS_ORDER: Record<GrievanceStatus, number> = {
  SUBMITTED: 0,
  AI_CLASSIFIED: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  REOPENED: 4,
  ESCALATED: 5,
  RESOLVED: 6,
  REJECTED: 7,
}

/**
 * The backend GET /grievances returns the caller's full (unpaginated) list
 * without query filtering. This pipeline applies the UI contract's
 * filter/sort/paginate semantics client-side so both modes behave identically.
 */
function filterAndSortGrievances(items: Grievance[], filters: GrievanceFilters): Grievance[] {
  let results = [...items]

  if (filters.statuses && filters.statuses.length > 0) {
    const statuses = new Set(filters.statuses)
    results = results.filter((grievance) => statuses.has(grievance.status))
  } else if (filters.status) {
    results = results.filter((grievance) => grievance.status === filters.status)
  }
  if (filters.priority) {
    results = results.filter((grievance) => grievance.priority === filters.priority)
  }
  if (filters.category) {
    results = results.filter((grievance) => grievance.category === filters.category)
  }
  if (filters.departmentId) {
    results = results.filter((grievance) => grievance.departmentId === filters.departmentId)
  }
  if (filters.officerId) {
    results = results.filter((grievance) => grievance.assignedOfficer?.id === filters.officerId)
  }
  if (filters.search) {
    const term = filters.search.trim().toLowerCase()
    results = results.filter(
      (grievance) =>
        grievance.title.toLowerCase().includes(term) ||
        grievance.description.toLowerCase().includes(term) ||
        grievance.ticketId.toLowerCase().includes(term) ||
        (grievance.location ?? grievance.address ?? '').toLowerCase().includes(term) ||
        (grievance.category ?? '').toLowerCase().includes(term),
    )
  }

  const sortBy = filters.sortBy ?? 'createdAt'
  const direction = filters.sortDir === 'asc' ? 1 : -1
  results.sort((a, b) => {
    if (sortBy === 'priority') {
      return (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]) * direction
    }
    if (sortBy === 'status') {
      return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * direction
    }
    return String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? '')) * direction
  })

  return results
}

/**
 * REAL API grievance adapter. Maps backend wire shapes (see
 * apps/api/src/controllers/grievance.controller.ts) to domain contracts.
 *
 * Known backend gaps handled here:
 * - list endpoints return plain arrays → wrapped in Paginated
 * - the create route persists `address` but not `location` → mapped
 * - the backend returns no active assignment → assignedOfficer stays null
 */
export const apiGrievanceService: GrievanceService = {
  async list(filters: GrievanceFilters = {}): Promise<Paginated<Grievance>> {
    const { data } = await client.get<GrievancesResponse>('/grievances')
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const filtered = filterAndSortGrievances(data.grievances, filters)
    return toPaginated(filtered, page, limit)
  },

  async getById(id: string): Promise<Grievance> {
    const { data } = await client.get<GrievanceResponse>(`/grievances/${id}`)
    return data.grievance
  },

  async create(request: CreateGrievanceRequest): Promise<Grievance> {
    const { data } = await client.post<GrievanceResponse>('/grievances', {
      title: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      departmentId: request.departmentId,
      address: request.address ?? request.location,
      latitude: request.latitude,
      longitude: request.longitude,
    })
    return data.grievance
  },

  async update(id: string, request: UpdateGrievanceRequest): Promise<Grievance> {
    const { data } = await client.patch<GrievanceResponse>(`/grievances/${id}`, {
      title: request.title,
      description: request.description,
      category: request.category,
      departmentId: request.departmentId,
      address: request.address ?? request.location,
      latitude: request.latitude,
      longitude: request.longitude,
    })
    return data.grievance
  },

  async updateStatus(id: string, request: UpdateGrievanceStatusRequest): Promise<Grievance> {
    const { data } = await client.patch<GrievanceResponse>(`/grievances/${id}/status`, {
      status: request.status,
      comment: request.comment,
    })
    return data.grievance
  },

  async remove(id: string): Promise<void> {
    await client.delete(`/grievances/${id}`)
  },

  async assign(id: string, request: AssignGrievanceRequest): Promise<Grievance> {
    const { data } = await client.post<GrievanceResponse>(`/grievances/${id}/assign`, {
      officerId: request.officerId,
      departmentId: request.departmentId,
      reason: request.reason,
    })
    return data.grievance
  },

  async escalate(id: string): Promise<Grievance> {
    const { data } = await client.post<GrievanceResponse>(`/grievances/${id}/escalate`)
    return data.grievance
  },

  async reopen(id: string, reason?: string): Promise<Grievance> {
    const { data } = await client.post<GrievanceResponse>(`/grievances/${id}/reopen`, {
      reason,
    })
    return data.grievance
  },

  async submitFeedback(id: string, request: CreateFeedbackRequest): Promise<Feedback> {
    const { data } = await client.post<FeedbackResponse>(`/grievances/${id}/feedback`, {
      rating: request.rating,
      comment: request.comment,
    })
    return data.feedback
  },

  async getComments(id: string): Promise<Comment[]> {
    const { data } = await client.get<CommentsResponse>(`/grievances/${id}/comments`)
    return data.comments
  },

  async addComment(id: string, request: CreateCommentRequest): Promise<Comment> {
    const { data } = await client.post<{ comment: Comment }>(`/grievances/${id}/comments`, {
      message: request.message,
      isInternal: request.isInternal,
    })
    return data.comment
  },

  async getAttachments(id: string): Promise<Attachment[]> {
    const { data } = await client.get<AttachmentsResponse>(`/grievances/${id}/attachments`)
    return data.attachments
  },

  async uploadAttachment(id: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await client.post<{ attachment: Attachment }>(
      `/grievances/${id}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return data.attachment
  },
}
