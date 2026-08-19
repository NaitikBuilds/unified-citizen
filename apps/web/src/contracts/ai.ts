import type { GrievanceStatus, Priority } from './grievance'

/**
 * AI availability states the UI must handle:
 * - available: AI produced a result
 * - unavailable: AI service is down / not configured
 * - timeout: AI service did not respond in time
 * - low_confidence: AI produced a result below the confidence threshold
 */
export type AiAvailability = 'available' | 'unavailable' | 'timeout' | 'low_confidence'

/**
 * Mirrors the backend `AIClassification` model. The current backend has no
 * AI endpoints; this contract represents the AI results a future backend or
 * AI service would return.
 */
export type AiClassification = {
  grievanceId: string
  category?: string | null
  department?: string | null
  priority?: Priority | null
  confidence?: number | null
  summary?: string | null
  duplicateScore?: number | null
  sentiment?: string | null
  severity?: string | null
  modelName?: string | null
  modelVersion?: string | null
  explanation?: string | null
  createdAt?: string
}

export type DuplicateMatch = {
  grievanceId: string
  ticketId: string
  title: string
  status: GrievanceStatus
  /** 0..1 similarity score. */
  score: number
  createdAt: string
}

export type AiAnalysisResult = {
  availability: AiAvailability
  classification: AiClassification | null
  duplicates: DuplicateMatch[]
}

export type AiChatRole = 'user' | 'assistant' | 'system'

export type AiChatMessage = {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
}

export type AiChatRequest = {
  message: string
}

export type AiChatResponse = {
  reply: string
  confidence?: number
  intent?: string
}
