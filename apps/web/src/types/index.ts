// ============= ENUMS =============
export type UserRole = "CITIZEN" | "OFFICER" | "DEPARTMENT_ADMIN" | "SUPER_ADMIN";

export type GrievanceStatus =
  | "SUBMITTED"
  | "AI_CLASSIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ESCALATED"
  | "RESOLVED"
  | "REJECTED"
  | "REOPENED";

export type GrievancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type NotificationType =
  | "GRIEVANCE_CREATED"
  | "STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "ASSIGNMENT_CHANGED"
  | "SYSTEM"
  | "SLA_WARNING"
  | "ESCALATION_CREATED";

export type AssignmentType = "MANUAL" | "AUTOMATIC" | "AI_RECOMMENDED" | "REASSIGNMENT";
export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type SLAStatus = "ACTIVE" | "WARNING" | "BREACHED" | "COMPLETED" | "PAUSED";
export type EscalationLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "ADMIN";
export type EscalationStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";

// ============= MODELS =============
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Grievance {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  status: GrievanceStatus;
  priority: GrievancePriority;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  citizenId: string;
  departmentId: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  aiClassification?: AIClassification | null;
  citizen?: { id: string; name: string; email: string };
  department?: { id: string; name: string; code?: string };
  assignments?: Assignment[];
  comments?: Comment[];
  attachments?: Attachment[];
  feedback?: Feedback[];
  escalations?: Escalation[];
  sla?: SLA | null;
}

export interface AIClassification {
  id: string;
  grievanceId: string;
  category: string | null;
  department: string | null;
  priority: GrievancePriority | null;
  sentiment: string | null;
  severity: string | null;
  confidence: number | null;
  summary: string | null;
  explanation: string | null;
  duplicateScore: number | null;
  modelName: string | null;
  modelVersion: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  grievanceId: string;
  officerId: string;
  departmentId: string;
  type: AssignmentType;
  status: AssignmentStatus;
  assignedById: string | null;
  assignedAt: string;
  completedAt: string | null;
  reason: string | null;
  officer?: { id: string; name: string; email: string };
  assignedBy?: { id: string; name: string } | null;
}

export interface Comment {
  id: string;
  grievanceId: string;
  isInternal: boolean;
  message: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; role: UserRole };
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  grievanceId: string | null;
  uploadedById: string;
  createdAt: string;
  uploadedBy?: { id: string; name: string; role: UserRole };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  grievanceId: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  userId: string | null;
  grievanceId: string | null;
  newValue: Record<string, unknown> | null;
  oldValue: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string } | null;
}

export interface SLA {
  id: string;
  grievanceId: string;
  departmentId: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  responseDueAt: string;
  resolutionDueAt: string;
  status: SLAStatus;
  responseCompletedAt: string | null;
  resolutionCompletedAt: string | null;
  breachedAt: string | null;
  policyId: string | null;
  createdAt: string;
}

export interface SLAPolicy {
  id: string;
  name: string;
  description: string | null;
  departmentId: string;
  category: string | null;
  priority: GrievancePriority | null;
  responseTimeHours: number;
  resolutionTimeHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  grievanceId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { id: string; name: string; role: UserRole };
}

export interface Escalation {
  id: string;
  grievanceId: string;
  level: EscalationLevel;
  status: EscalationStatus;
  reason: string;
  createdById: string | null;
  createdAt: string;
  resolvedAt: string | null;
  escalatedAt: string;
  createdBy?: { id: string; name: string } | null;
}

// ============= API RESPONSES =============
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface GrievanceListResponse {
  grievances: Grievance[];
  meta: PaginationMeta;
}

export interface CommentListResponse {
  comments: Comment[];
  meta: PaginationMeta;
}

export interface NotificationListResponse {
  notifications: Notification[];
  meta: PaginationMeta;
}

export interface UserListResponse {
  users: User[];
  meta: PaginationMeta;
}

export interface DepartmentListResponse {
  departments: Department[];
}

export interface ChatResponse {
  message: string;
}

export interface ApiError {
  success?: boolean;
  error?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
