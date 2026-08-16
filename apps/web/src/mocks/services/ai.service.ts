import type {
  AiAnalysisResult,
  AiChatMessage,
  AiChatRequest,
  AiChatResponse,
} from '../../contracts/ai'
import type { AiService } from '../../api/services/ai.service'
import {
  getMockClassification,
  mockDuplicateMatches,
} from '../data/ai'
import { maybeFail, simulateLatency } from './mockUtils'

function buildReply(message: string): string {
  const text = message.toLowerCase()

  if (text.includes('status') || text.includes('track') || text.includes('update')) {
    return (
      'You can track your grievance on the My Grievances page. Each grievance shows ' +
      'its current status — Submitted, AI Classified, Assigned, In Progress, Resolved — ' +
      'along with officer updates and the department handling it.'
    )
  }

  if (text.includes('submit') || text.includes('file') || text.includes('complaint')) {
    return (
      'To submit a grievance, go to Submit Grievance, describe the issue, pick a category, ' +
      'add the location, and attach any photos or documents. Our AI will classify it and route ' +
      'it to the right department automatically.'
    )
  }

  if (text.includes('duplicate')) {
    return (
      'If your grievance looks similar to an existing one, we show a duplicate warning with ' +
      'a similarity score. You can still submit it — it will be reviewed and merged if needed.'
    )
  }

  if (text.includes('sla') || text.includes('time') || text.includes('how long')) {
    return (
      'Every grievance gets a Service Level Agreement (SLA) with response and resolution ' +
      'deadlines. You can see the SLA progress on the grievance details page.'
    )
  }

  if (text.includes('escalat')) {
    return (
      'You can escalate a grievance if it is not addressed in time or the situation is urgent. ' +
      'Escalation raises the priority and brings it to the attention of senior officials.'
    )
  }

  if (text.includes('feedback') || text.includes('rate')) {
    return (
      'Once your grievance is resolved, you can rate your experience (1–5) and leave a comment ' +
      'on the grievance details page. Your feedback helps us improve services.'
    )
  }

  if (text.includes('hello') || text.includes('hi ') || text === 'hi') {
    return 'Hello! I am the Citizen Assistant. Ask me about submitting, tracking, or escalating grievances.'
  }

  return (
    'I can help with submitting and tracking grievances, understanding SLA deadlines, ' +
    'escalations, and feedback. Could you rephrase your question?'
  )
}

/**
 * MOCK AI service. MOCK ONLY — the backend has no AI endpoints. Results are
 * clearly labeled as simulated; the AI boundary contract stays identical for
 * a future real implementation.
 */
export const mockAiService: AiService = {
  async analyzeGrievance(grievanceId: string): Promise<AiAnalysisResult> {
    maybeFail('ai.analyze')
    await simulateLatency(400, 900)

    const classification = getMockClassification(grievanceId)

    if (!classification) {
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
      classification: { ...classification },
      duplicates: (mockDuplicateMatches[grievanceId] ?? []).map((match) => ({ ...match })),
    }
  },

  async chat(
    request: AiChatRequest,
    _history?: AiChatMessage[],
  ): Promise<AiChatResponse> {
    maybeFail('ai.chat')
    await simulateLatency(300, 800)

    return {
      reply: buildReply(request.message),
      confidence: 0.9,
      intent: 'general_query',
    }
  },
}
