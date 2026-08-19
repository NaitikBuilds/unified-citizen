import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const pager = await ai.models.list();

  for await (const model of pager) {
    console.log(model.name);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
