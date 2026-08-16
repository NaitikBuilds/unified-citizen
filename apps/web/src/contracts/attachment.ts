import type { UserRole } from './auth'

export type AttachmentAuthor = {
  id: string
  name: string
  role: UserRole
}

export type Attachment = {
  id: string
  grievanceId?: string | null
  fileName: string
  fileType?: string | null
  fileUrl: string
  fileSize?: number | null
  uploadedById: string
  uploadedBy?: AttachmentAuthor
  createdAt: string
}

/** Raw file upload; sent as multipart/form-data to the backend. */
export type UploadAttachmentRequest = {
  file: File
}
