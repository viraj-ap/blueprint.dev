import { generateContent } from "../../lib/gemini.js";
import {
  PLAN_SYSTEM_PROMPT,
  REFINER_SYSTEM_INSTRUCTION,
  ENHANCE_SYSTEM_PROMPT,
} from "../../config/constants.js";

export async function generatePlan(userPrompt) {
  if (!userPrompt) return null;

  const fullContent = `${PLAN_SYSTEM_PROMPT}\n\nPROJECT IDEA: ${userPrompt}\n\nGenerate the plan in Markdown.`;
  const response = await generateContent("gemini-2.5-flash", fullContent);

  if (!response) return null;

  const cleanMarkdown = response
    .replace(/^```markdown\s*/, "")
    .replace(/```$/, "")
    .trim();

  return {
    projectTitle: "Generated Plan",
    content: cleanMarkdown,
  };
}

export async function refinePlan(planContent, issues) {
  if (!planContent) return null;

  const response = await generateContent(
    "gemini-2.5-flash",
    `${REFINER_SYSTEM_INSTRUCTION}\n\nISSUES DETECTED:\n${JSON.stringify(issues)}\n\nPLAN CONTENT:\n${planContent}`,
  );

  return response;
}

export async function enhancePlan(currentContent, annotations) {
  if (!currentContent) return null;

  const prompt = `
    CURRENT DOCUMENT:
    ${currentContent}

    USER ANNOTATIONS:
    ${JSON.stringify(annotations, null, 2)}

    Please refactor the document.
    `;

  const fullContent = `${ENHANCE_SYSTEM_PROMPT}\n\n${prompt}`;
  const response = await generateContent("gemini-2.5-flash", fullContent);

  if (!response) return null;

  return response
    .replace(/^```markdown\s*/, "")
    .replace(/```$/, "")
    .trim();
}
