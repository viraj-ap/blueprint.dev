import { generateContent } from "../../lib/gemini.js";
import { SECURITY_SYSTEM_INSTRUCTION } from "../../config/constants.js";

export async function analyzeSecurity(planContent) {
  if (!planContent) return [];

  const response = await generateContent(
    "gemini-2.5-flash",
    `${SECURITY_SYSTEM_INSTRUCTION}\n\nPLAN CONTENT:\n${planContent}`,
    { responseMimeType: "application/json" },
  );

  if (!response) return [];

  try {
    const cleanJson = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Security Analysis JSON Parse Error:", e);
    return [];
  }
}
