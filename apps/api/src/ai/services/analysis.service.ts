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

export interface UnifiedAIAnalysisResult {
  classification: AIClassificationOutput;
  duplicateDetection: DuplicateDetectionResult;
  spamDetection: SpamDetectionOutput;
}

export async function analyzeGrievance(
  title: string,
  description: string,
  category: string | null,
  departmentId: string | null,
  citizenId: string,
): Promise<UnifiedAIAnalysisResult> {
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
