import "server-only";
import { GoogleGenAI } from "@google/genai";

// Don't log env presence in production (optional but safer)
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY. Add it to .env (server-side) and restart the dev server."
  );
}

export const genAI = new GoogleGenAI({ apiKey });