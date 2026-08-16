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
import {
  type GrievanceFilters,
  type GrievanceService,
} from '../../api/services/grievance.service'
import { tokenStorage } from '../../auth/tokenStorage'
import { ApiError } from '../../utils/errors'
import { mockGrievances } from '../data/grievances'
import { mockDepartments } from '../data/departments'
import { mockComments } from '../data/comments'
import { mockAttachments } from '../data/attachments'
import { mockFeedback } from '../data/feedback'
import { getMockUser } from '../data/users'
import { matchesSearch, maybeFail, paginate, simulateLatency } from './mockUtils'

const PRIORITY_WEIGHT: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0,
  AI_CLASSIFIED: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  REOPENED: 4,
  ESCALATED: 5,
  RESOLVED: 6,
  REJECTED: 7,
}

/** Mirrors the backend's role-scoped grievance visibility (see grievance.controller.ts). */
function scopeToCurrentUser(): (grievance: Grievance) => boolean {
  const user = tokenStorage.getStoredUser()
  if (!user) {
    return () => false
  }
  if (user.role === 'CITIZEN') {
    return (grievance) => grievance.citizenId === user.id
  }
  if (user.role === 'OFFICER' || user.role === 'DEPARTMENT_ADMIN') {
    return (grievance) => grievance.departmentId === user.departmentId
  }
  return () => true
}

function cloneGrievance(grievance: Grievance): Grievance {
  return {
    ...grievance,
    department: grievance.department ? { ...grievance.department } : null,
    citizen: grievance.citizen ? { ...grievance.citizen } : null,
    assignedOfficer: grievance.assignedOfficer ? { ...grievance.assignedOfficer } : null,
  }
}

/**
 * MOCK grievance service — full CRUD over the in-memory dataset with
 * role-scoped visibility, filtering, sorting and pagination. MOCK ONLY.
 */
export const mockGrievanceService: GrievanceService = {
  async list(filters: GrievanceFilters = {}): Promise<Paginated<Grievance>> {
    maybeFail('grievance.list')
    await simulateLatency()

    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const inScope = scopeToCurrentUser()

    let results = mockGrievances.filter(inScope)

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
    if (filters.from) {
      results = results.filter((grievance) => grievance.createdAt >= (filters.from ?? ''))
    }
    if (filters.to) {
      results = results.filter((grievance) => grievance.createdAt <= (filters.to ?? ''))
    }
    if (filters.search) {
      const term = filters.search.toLowerCase()
      results = results.filter(
        (grievance) =>
          matchesSearch(grievance, filters.search, ['title', 'description', 'ticketId', 'location']) ||
          grievance.ticketId.toLowerCase().includes(term) ||
          grievance.category?.toLowerCase().includes(term) === true,
      )
    }

    const sortBy = filters.sortBy ?? 'createdAt'
    const sortDir = filters.sortDir ?? 'desc'
    const direction = sortDir === 'asc' ? 1 : -1

    results = [...results].sort((a, b) => {
      if (sortBy === 'priority') {
        return (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]) * direction
      }
      if (sortBy === 'status') {
        return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * direction
      }
      const aValue = a[sortBy] ?? ''
      const bValue = b[sortBy] ?? ''
      return String(aValue).localeCompare(String(bValue)) * direction
    })

    return paginate(results.map(cloneGrievance), page, limit)
  },

  async getById(id: string): Promise<Grievance> {
    maybeFail('grievance.getById')
    await simulateLatency()

    const grievance = mockGrievances.find((item) => item.id === id)
    if (!grievance) {
      throw new ApiError('Grievance not found', 404)
    }
    if (!scopeToCurrentUser()(grievance)) {
      throw new ApiError('Forbidden', 403)
    }
    return cloneGrievance(grievance)
  },

  async create(request: CreateGrievanceRequest): Promise<Grievance> {
    maybeFail('grievance.create')
    await simulateLatency()

    const user = tokenStorage.getStoredUser()
    if (!user) {
      throw new ApiError('Unauthorized', 401)
    }

    const now = new Date().toISOString()
    const grievance: Grievance = {
      id: `GRV-${Date.now()}`,
      ticketId: `GRV-${Date.now()}`,
      title: request.title.trim(),
      description: request.description.trim(),
      status: 'SUBMITTED',
      priority: request.priority ?? 'MEDIUM',
      category: request.category,
      departmentId: request.departmentId ?? null,
      department: mockDepartments.find((item) => item.id === request.departmentId)
        ? { id: request.departmentId ?? '', name: mockDepartments.find((item) => item.id === request.departmentId)?.name ?? '' }
        : null,
      citizenId: user.id,
      citizen: { id: user.id, name: user.name, email: user.email },
      location: request.location ?? request.address ?? null,
      address: request.address ?? request.location ?? null,
      latitude: request.latitude ?? null,
      longitude: request.longitude ?? null,
      createdAt: now,
      updatedAt: now,
    }

    mockGrievances.unshift(grievance)
    return cloneGrievance(grievance)
  },

  async update(id: string, request: UpdateGrievanceRequest): Promise<Grievance> {
    maybeFail('grievance.update')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }

    mockGrievances[index] = {
      ...mockGrievances[index],
      ...(request.title ? { title: request.title } : {}),
      ...(request.description ? { description: request.description } : {}),
      ...(request.category ? { category: request.category } : {}),
      ...(request.departmentId ? { departmentId: request.departmentId } : {}),
      ...(request.location !== undefined ? { location: request.location } : {}),
      ...(request.address !== undefined ? { address: request.address } : {}),
      ...(request.latitude !== undefined ? { latitude: request.latitude } : {}),
      ...(request.longitude !== undefined ? { longitude: request.longitude } : {}),
      updatedAt: new Date().toISOString(),
    }

    return cloneGrievance(mockGrievances[index])
  },

  async updateStatus(id: string, request: UpdateGrievanceStatusRequest): Promise<Grievance> {
    maybeFail('grievance.updateStatus')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }

    const previous = mockGrievances[index].status
    if (previous === request.status) {
      return cloneGrievance(mockGrievances[index])
    }

    mockGrievances[index] = {
      ...mockGrievances[index],
      status: request.status,
      ...(request.status === 'RESOLVED' || request.status === 'REJECTED'
        ? { resolvedAt: new Date().toISOString() }
        : {}),
      updatedAt: new Date().toISOString(),
    }

    return cloneGrievance(mockGrievances[index])
  },

  async remove(id: string): Promise<void> {
    maybeFail('grievance.remove')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }
    const grievance = mockGrievances[index]
    if (grievance.status !== 'SUBMITTED') {
      throw new ApiError('Cannot delete grievance after it has been processed', 400)
    }
    mockGrievances.splice(index, 1)
  },

  async assign(id: string, request: AssignGrievanceRequest): Promise<Grievance> {
    maybeFail('grievance.assign')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }

    const officer = getMockUser(request.officerId)
    if (!officer || officer.role !== 'OFFICER') {
      throw new ApiError('Selected user is not an officer', 400)
    }
    if (!officer.departmentId) {
      throw new ApiError('Selected officer is not assigned to a department', 400)
    }

    mockGrievances[index] = {
      ...mockGrievances[index],
      status: mockGrievances[index].status === 'SUBMITTED' ? 'IN_PROGRESS' : mockGrievances[index].status,
      assignedOfficer: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        departmentId: officer.departmentId,
        isActive: true,
      },
      updatedAt: new Date().toISOString(),
    }

    return cloneGrievance(mockGrievances[index])
  },

  async escalate(id: string): Promise<Grievance> {
    maybeFail('grievance.escalate')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }

    mockGrievances[index] = {
      ...mockGrievances[index],
      priority: 'CRITICAL',
      status: 'ESCALATED',
      updatedAt: new Date().toISOString(),
    }

    return cloneGrievance(mockGrievances[index])
  },

  async reopen(id: string, reason?: string): Promise<Grievance> {
    maybeFail('grievance.reopen')
    await simulateLatency()

    const index = mockGrievances.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiError('Grievance not found', 404)
    }
    if (mockGrievances[index].status !== 'RESOLVED') {
      throw new ApiError('Only resolved grievances can be reopened', 400)
    }

    mockGrievances[index] = {
      ...mockGrievances[index],
      status: 'REOPENED',
      updatedAt: new Date().toISOString(),
    }

    if (reason) {
      const user = tokenStorage.getStoredUser()
      mockComments.unshift({
        id: `cmt-mock-${Date.now()}`,
        grievanceId: id,
        userId: user?.id ?? 'unknown',
        message: `Grievance reopened by citizen. Reason: ${reason}`,
        isInternal: false,
        createdAt: new Date().toISOString(),
        user: user ? { id: user.id, name: user.name, role: user.role } : undefined,
      })
    }

    return cloneGrievance(mockGrievances[index])
  },

  async submitFeedback(id: string, request: CreateFeedbackRequest): Promise<Feedback> {
    maybeFail('grievance.submitFeedback')
    await simulateLatency()

    const grievance = mockGrievances.find((item) => item.id === id)
    if (!grievance) {
      throw new ApiError('Grievance not found', 404)
    }
    if (grievance.status !== 'RESOLVED') {
      throw new ApiError('Can only provide feedback on resolved grievances', 400)
    }

    const user = tokenStorage.getStoredUser()
    const exists = mockFeedback.some(
      (item) => item.grievanceId === id && item.userId === (user?.id ?? ''),
    )
    if (exists) {
      throw new ApiError('Feedback has already been submitted for this grievance', 409)
    }

    const feedback: Feedback = {
      id: `fb-mock-${Date.now()}`,
      grievanceId: id,
      userId: user?.id ?? 'unknown',
      rating: request.rating,
      comment: request.comment ?? null,
      createdAt: new Date().toISOString(),
    }

    mockFeedback.unshift(feedback)
    return feedback
  },

  async getComments(id: string): Promise<Comment[]> {
    maybeFail('grievance.getComments')
    await simulateLatency()

    const user = tokenStorage.getStoredUser()
    const visible = mockComments.filter(
      (comment) =>
        comment.grievanceId === id &&
        (user?.role === 'CITIZEN' ? !comment.isInternal : true),
    )
    return visible.map((comment) => ({ ...comment }))
  },

  async addComment(id: string, request: CreateCommentRequest): Promise<Comment> {
    maybeFail('grievance.addComment')
    await simulateLatency()

    const user = tokenStorage.getStoredUser()
    if (!user) {
      throw new ApiError('Unauthorized', 401)
    }
    if (!mockGrievances.some((item) => item.id === id)) {
      throw new ApiError('Grievance not found', 404)
    }

    const comment: Comment = {
      id: `cmt-mock-${Date.now()}`,
      grievanceId: id,
      userId: user.id,
      message: request.message.trim(),
      isInternal: user.role === 'CITIZEN' ? false : (request.isInternal ?? false),
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, role: user.role },
    }

    mockComments.push(comment)
    return comment
  },

  async getAttachments(id: string): Promise<Attachment[]> {
    maybeFail('grievance.getAttachments')
    await simulateLatency()
    return mockAttachments
      .filter((attachment) => attachment.grievanceId === id)
      .map((attachment) => ({ ...attachment }))
  },

  async uploadAttachment(id: string, file: File): Promise<Attachment> {
    maybeFail('grievance.uploadAttachment')
    await simulateLatency()

    const user = tokenStorage.getStoredUser()
    if (!user) {
      throw new ApiError('Unauthorized', 401)
    }

    const attachment: Attachment = {
      id: `att-mock-${Date.now()}`,
      grievanceId: id,
      fileName: file.name,
      fileType: file.type || null,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      uploadedById: user.id,
      uploadedBy: { id: user.id, name: user.name, role: user.role },
      createdAt: new Date().toISOString(),
    }

    mockAttachments.push(attachment)
    return attachment
  },
}