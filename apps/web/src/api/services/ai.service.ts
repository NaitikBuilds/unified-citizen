import type {
  AiAnalysisResult,
  AiChatMessage,
  AiChatRequest,
  AiChatResponse,
} from '../../contracts/ai'

/**
 * AI service interface. Frontend consumes AI results exclusively through
 * this contract — never a direct AI implementation.
 *
 * MOCK ONLY: the backend has no AI endpoints yet. The registry wires this to
 * the mock implementation until a backend/AI service exists.
 */
export interface AiService {
  /** Classifies a grievance (category, department, priority, confidence, duplicates). */
  analyzeGrievance(grievanceId: string): Promise<AiAnalysisResult>
  /** Conversational assistant. History is passed for context; identity comes from the session. */
  chat(request: AiChatRequest, history?: AiChatMessage[]): Promise<AiChatResponse>
}
