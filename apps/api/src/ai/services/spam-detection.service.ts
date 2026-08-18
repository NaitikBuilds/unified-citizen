import { getGemini } from "../providers/gemini.provider.js";
import {
  buildSpamDetectionPrompt,
  spamDetectionSystemPrompt,
} from "../prompts/spam-detection.prompt.js";
import {
  spamDetectionSchema,
  type SpamDetectionOutput,
} from "../schemas/spam-output.schema.js";

export type { SpamDetectionOutput };

const MODEL_NAME = "gemini-3.5-flash";

function createFallbackSpamResult(): SpamDetectionOutput {
  return {
    isSpam: false,
    spamScore: 0,
    confidence: 0,
    reason:
      "AI spam detection was unavailable. The grievance was treated as legitimate so that a valid citizen complaint is not incorrectly rejected.",
  };
}

export async function detectSpam(
  title: string,
  description: string,
): Promise<SpamDetectionOutput> {
  const prompt = `
${spamDetectionSystemPrompt}

${buildSpamDetectionPrompt(title, description)}
`;

  try {
    const response = await getGemini().models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty spam detection response");
    }

    console.log("RAW SPAM DETECTION RESPONSE:");
    console.log(text);

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid spam detection JSON");
    }

    const result = spamDetectionSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error(
        `Spam detection validation failed: ${result.error.message}`,
      );
    }

    return result.data;
  } catch (error) {
    console.error("AI spam detection failed. Using safe fallback:", error);

    return createFallbackSpamResult();
  }
}
