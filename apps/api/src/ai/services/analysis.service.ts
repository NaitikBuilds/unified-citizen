import { classifyGrievance } from "./classification.service.js";
import {
  detectDuplicateGrievance,
  type DuplicateDetectionResult,
} from "./duplicate-detection.service.js";
import {
  detectSpam,
  type SpamDetectionOutput,
} from "./spam-detection.service.js";

import type { AIClassificationOutput } from "../schemas/ai-output.schema.js";
import { isGeminiConfigured } from "../providers/gemini.provider.js";

export interface UnifiedAIAnalysisResult {
  classification: AIClassificationOutput;
  duplicateDetection: DuplicateDetectionResult;
  spamDetection: SpamDetectionOutput;
}

/**
 * Sentinel model identifiers used when the Gemini provider is not configured.
 *
 * These strings MUST stay stable: the frontend explicitly recognises them to
 * render a graceful "AI analysis unavailable" state instead of pretending the
 * AI produced a result.
 */
const UNCONFIGURED_MODEL_NAME = "unconfigured";
const UNCONFIGURED_MODEL_VERSION = "0";

/**
 * Safe default classification when Gemini is not configured. The shape
 * satisfies the AIClassificationOutput schema; the `modelName` marker is
 * the contract the frontend uses to render the unavailable state.
 *
 * The `department` value MUST correspond to an active department in the
 * database (seed defines "OTHER") so that downstream code which maps the
 * AI department to a Department record does not throw.
 */
function createUnconfiguredClassification(
  requestedCategory: string | null,
): AIClassificationOutput {
  return {
    category: requestedCategory ?? "OTHER",
    department: "OTHER",
    priority: "MEDIUM",
    severity: "LOW",
    sentiment: "NEUTRAL",
    confidence: 0,
    summary:
      "AI classification is unavailable because the Gemini provider is not configured. The grievance was recorded with safe defaults so that citizen submissions are never blocked by a missing API key.",
    explanation:
      "GEMINI_API_KEY is not set on the server. No AI classification was performed.",
  };
}

function createUnconfiguredDuplicateResult(): DuplicateDetectionResult {
  return {
    relationship: "UNRELATED",
    duplicateScore: 0,
    explanation:
      "AI duplicate detection was unavailable because the Gemini provider is not configured. The grievance was treated as unique so that a valid citizen complaint is not incorrectly blocked.",
  };
}

function createUnconfiguredSpamResult(): SpamDetectionOutput {
  return {
    isSpam: false,
    spamScore: 0,
    confidence: 0,
    reason:
      "AI spam detection was unavailable because the Gemini provider is not configured. The grievance was treated as legitimate so that a valid citizen complaint is not incorrectly rejected.",
  };
}

export async function analyzeGrievance(
  title: string,
  description: string,
  category: string | null,
  departmentId: string | null,
  citizenId: string,
): Promise<UnifiedAIAnalysisResult> {
  /*
   * When the Gemini provider is not configured, short-circuit to safe
   * defaults so that citizen grievance submission is never blocked by a
   * missing API key. The returned values are explicitly marked as
   * unconfigured (modelName sentinel) so the UI can render a graceful
   * "AI analysis unavailable" state instead of pretending the AI produced
   * a real result.
   *
   * Spam and duplicate detection also use safe defaults for the same
   * reason: their real implementations would themselves throw on
   * getGemini() when the key is missing.
   */
  if (!isGeminiConfigured()) {
    return {
      classification: createUnconfiguredClassification(category),
      duplicateDetection: createUnconfiguredDuplicateResult(),
      spamDetection: createUnconfiguredSpamResult(),
    };
  }

  /*
   * Run the independent AI analyses together.
   *
   * Promise.all allows classification, duplicate detection
   * and spam detection to execute concurrently.
   */
  const [classification, duplicateDetection, spamDetection] = await Promise.all(
    [
      classifyGrievance(title, description),

      detectDuplicateGrievance(
        title,
        description,
        category,
        departmentId,
        citizenId,
      ),

      detectSpam(title, description),
    ],
  );

  return {
    classification,
    duplicateDetection,
    spamDetection,
  };
}

export const AI_UNCONFIGURED_MARKERS = {
  modelName: UNCONFIGURED_MODEL_NAME,
  modelVersion: UNCONFIGURED_MODEL_VERSION,
} as const;
