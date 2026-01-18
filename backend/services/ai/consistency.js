import { generateContent } from "../../lib/gemini.js";
import { CONTRADICTION_SYSTEM_INSTRUCTION } from "../../config/constants.js";

export async function analyzeContradictions(planContent) {
  if (!planContent) return { contradiction: false, issues: [] };

  const response = await generateContent(
    "gemini-2.5-flash",
    `${CONTRADICTION_SYSTEM_INSTRUCTION}\n\nPLAN CONTENT:\n${planContent}`,
    { responseMimeType: "application/json" },
  );

  if (!response) return { contradiction: false, issues: [] };

  try {
    const cleanJson = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Contradiction Analysis JSON Parse Error:", e);
    return { contradiction: false, issues: [] };
  }
}
