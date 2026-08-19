import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";

dns.setDefaultResultOrder("ipv4first");

let gemini: GoogleGenAI | null = null;

/**
 * Safe configuration check. Returns true only when the Gemini provider can
 * actually be instantiated. Callers MUST short-circuit before invoking any
 * Gemini-backed service when this returns false so a missing key never
 * breaks the request path (e.g. grievance creation).
 *
 * Never logs the API key value.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGemini(): GoogleGenAI {
  if (!gemini) {
    if (!isGeminiConfigured()) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    gemini = new GoogleGenAI({
      // The API key is read here only when a real call is about to be made;
      // callers must gate on isGeminiConfigured() first so this path is
      // never reached with a missing key.
      apiKey: process.env.GEMINI_API_KEY as string,
    });
  }

  return gemini;
}
