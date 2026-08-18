import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";

dns.setDefaultResultOrder("ipv4first");

let gemini: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!gemini) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    gemini = new GoogleGenAI({
      apiKey,
    });
  }

  return gemini;
}
