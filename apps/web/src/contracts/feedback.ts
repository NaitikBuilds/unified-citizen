export type Feedback = {
  id: string
  grievanceId: string
  userId: string
  rating: number
  comment?: string | null
  createdAt: string
}

export type CreateFeedbackRequest = {
  /** Integer between 1 and 5 (backend-enforced). */
  rating: number
  comment?: string
}
