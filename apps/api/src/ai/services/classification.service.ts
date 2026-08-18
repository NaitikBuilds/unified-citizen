import { getGemini } from "../providers/gemini.provider.js";
import {
  buildClassificationPrompt,
  classificationSystemPrompt,
} from "../prompts/classification.prompt.js";
import {
  aiClassificationSchema,
  type AIClassificationOutput,
} from "../schemas/ai-output.schema.js";

const MODEL_NAME = "gemini-3.5-flash";

function createFallbackClassification(
  title: string,
  description: string,
): AIClassificationOutput {
  return {
    category: "Other",
    department: "OTHER",
    priority: "MEDIUM",
    severity: "MEDIUM",
    sentiment: "NEUTRAL",
    confidence: 0,
    summary: `${title}: ${description}`.slice(0, 500),
    explanation:
      "AI classification was unavailable. A safe fallback classification was applied so the grievance could still be recorded and processed.",
  };
}

export async function classifyGrievance(
  title: string,
  description: string,
): Promise<AIClassificationOutput> {
  const prompt = `
${classificationSystemPrompt}

${buildClassificationPrompt(title, description)}
`;

  try {
    const response = await getGemini().models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }

    const result = aiClassificationSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error(
        `Gemini classification failed validation: ${result.error.message}`,
      );
    }

    return result.data;
  } catch (error) {
    console.error(
      "AI classification failed. Using fallback classification:",
      error,
    );

    return createFallbackClassification(title, description);
  }
}
