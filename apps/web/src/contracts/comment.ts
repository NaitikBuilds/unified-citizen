import type { UserRole } from './auth'

export type CommentAuthor = {
  id: string
  name: string
  role: UserRole
}

export type Comment = {
  id: string
  grievanceId: string
  userId: string
  message: string
  isInternal: boolean
  createdAt: string
  updatedAt?: string
  user?: CommentAuthor
}

export type CreateCommentRequest = {
  message: string
  isInternal?: boolean
}
