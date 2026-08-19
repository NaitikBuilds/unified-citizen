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
  EscalateGrievanceRequest,
  Grievance,
  GrievanceListParams,
  UpdateGrievanceRequest,
  UpdateGrievanceStatusRequest,
} from '../../contracts/grievance'

/** List filters for grievance queries (superset of GrievanceListParams). */
export type GrievanceFilters = GrievanceListParams

export interface GrievanceService {
  list(filters?: GrievanceFilters): Promise<Paginated<Grievance>>
  getById(id: string): Promise<Grievance>
  create(request: CreateGrievanceRequest): Promise<Grievance>
  update(id: string, request: UpdateGrievanceRequest): Promise<Grievance>
  updateStatus(id: string, request: UpdateGrievanceStatusRequest): Promise<Grievance>
  remove(id: string): Promise<void>
  assign(id: string, request: AssignGrievanceRequest): Promise<Grievance>
  escalate(id: string, request: EscalateGrievanceRequest): Promise<Grievance>
  reopen(id: string, reason?: string): Promise<Grievance>
  submitFeedback(id: string, request: CreateFeedbackRequest): Promise<Feedback>
  getComments(id: string): Promise<Comment[]>
  addComment(id: string, request: CreateCommentRequest): Promise<Comment>
  getAttachments(id: string): Promise<Attachment[]>
  uploadAttachment(id: string, file: File): Promise<Attachment>
  downloadAttachment(grievanceId: string, attachmentId: string, filename?: string): Promise<void>
}