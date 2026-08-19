import type {
  AiAnalysisResult,
  AiChatMessage,
  AiChatRequest,
  AiChatResponse,
} from '../../contracts/ai'
import type { AiService } from '../services/ai.service'
import { client } from '../client'
import { apiGrievanceService } from './grievance.adapter'

interface ChatResponse {
  message: string
}

/**
 * Explicit marker written by the backend when the Gemini provider is not
 * configured (apps/api/src/ai/services/analysis.service.ts). When this value
 * appears on a persisted classification the UI MUST treat it as "AI analysis
 * unavailable" and never display it as a real AI result.
 */
const UNCONFIGURED_MODEL_NAME = 'unconfigured'

/**
 * Real API adapter for the AI subsystem.
 *
 * - chat: calls POST /api/v1/chat with { message } and maps data.message -> reply.
 *   (Note: The current backend endpoint POST /api/v1/chat does not accept client-provided
 *   chat history; the backend reconstructs relevant citizen context internally from the session.)
 * - analyzeGrievance: loads the grievance through the existing grievance API (GET /api/v1/grievances/:id)
 *   and maps its persisted aiClassification into an AiAnalysisResult.
 */
export const apiAiService: AiService = {
  async chat(
    request: AiChatRequest,
    _history?: AiChatMessage[],
  ): Promise<AiChatResponse> {
    const { data } = await client.post<ChatResponse>('/chat', {
      message: request.message,
    })

    return {
      reply: data.message,
    }
  },

  async analyzeGrievance(grievanceId: string): Promise<AiAnalysisResult> {
    try {
      const grievance = await apiGrievanceService.getById(grievanceId)
      const classification = grievance.aiClassification

      if (!classification) {
        return {
          availability: 'unavailable',
          classification: null,
          duplicates: [],
        }
      }

      // Explicit unconfigured marker: the backend stored a stub because
      // GEMINI_API_KEY was not set. Render as unavailable and do not show
      // any of the placeholder values as if they were a real AI result.
      if (classification.modelName === UNCONFIGURED_MODEL_NAME) {
        return {
          availability: 'unavailable',
          classification: null,
          duplicates: [],
        }
      }

      const confidence = classification.confidence ?? 0
      const availability =
        confidence > 0 && confidence < 0.5 ? 'low_confidence' : 'available'

      return {
        availability,
        classification: {
          grievanceId: classification.grievanceId ?? grievanceId,
          category: classification.category,
          department: classification.department,
          priority: classification.priority,
          confidence: classification.confidence,
          summary: classification.summary,
          duplicateScore: classification.duplicateScore,
          sentiment: classification.sentiment,
          severity: classification.severity,
          modelName: classification.modelName,
          modelVersion: classification.modelVersion,
          explanation: classification.explanation,
          createdAt: classification.createdAt,
        },
        duplicates: [],
      }
    } catch {
      return {
        availability: 'unavailable',
        classification: null,
        duplicates: [],
      }
    }
  },
}
