import { generateContent } from "../../lib/gemini.js";
import { SYSTEM_INSTRUCTION_ARCHITECT } from "../../config/constants.js";

export async function analyzeContext(planSteps, chatHistory) {
  const prompt = `
    CURRENT PLAN: ${JSON.stringify(planSteps)}
    RECENT CHAT LOG: ${JSON.stringify(chatHistory.slice(-5))} 
    
    Analyze the last comment. Is intervention needed?
  `;

  const response = await generateContent(
    "gemini-2.5-flash",
    `${SYSTEM_INSTRUCTION_ARCHITECT}\n\n${prompt}`,
    { responseMimeType: "application/json" },
  );

  if (!response) return null;

  try {
    const cleanJson = response.replace(/```json|```/g, "").trim();
    if (cleanJson === "NULL" || !cleanJson) return null;
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Context Analysis JSON Parse Error:", e);
    return null;
  }
}
