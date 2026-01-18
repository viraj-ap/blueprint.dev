import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is missing in environment variables.");
}

export const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

export const generateContent = async (model, contents, config = {}) => {
  if (!ai) return null;
  try {
    const result = await ai.models.generateContent({
      model,
      contents,
      config,
    });
    return typeof result.text === "function" ? result.text() : result.text;
  } catch (error) {
    console.error(`Gemini API Error (${model}):`, error);
    return null;
  }
};
