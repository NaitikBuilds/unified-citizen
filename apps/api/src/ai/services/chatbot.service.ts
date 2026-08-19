import { getGemini } from "../providers/gemini.provider.js";
import { buildChatbotPrompt } from "../prompts/chatbot.prompt.js";
import { getCitizenContext } from "./citizen-context.service.js";

const MODEL_NAME = "gemini-3.5-flash";

export async function chatWithCitizen(
  citizenId: string,
  message: string,
): Promise<string> {
  try {
    const context = await getCitizenContext(citizenId);

    const prompt = buildChatbotPrompt(message, context);

    const response = await getGemini().models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty chatbot response");
    }

    return text;
  } catch (error) {
    console.error("AI chatbot failed. Using safe fallback:", error);

    return "I'm currently unable to access the AI assistant. You can still submit and track your grievance through the system.";
  }
}
