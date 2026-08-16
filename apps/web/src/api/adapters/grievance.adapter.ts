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
    const { data } = await client.get<GrievancesResponse>('/grievances', {
      params: filters,
    })
    return toPaginated(data.grievances, filters.page, filters.limit)
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
