import {
  analyzeSecurity,
  analyzeContradictions,
  assessRisk,
  refinePlan,
  enhancePlan,
} from "../services/geminiService.js";

export const handleSecurityAnalysis = async (req, res) => {
  try {
    const { planContent } = req.body;
    const result = await analyzeSecurity(planContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze security" });
  }
};

export const handleContradictionAnalysis = async (req, res) => {
  try {
    const { planContent } = req.body;
    const result = await analyzeContradictions(planContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze contradictions" });
  }
};

export const handleRiskAssessment = async (req, res) => {
  try {
    const { planContent } = req.body;
    const result = await assessRisk(planContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to assess risk" });
  }
};

export const handleRefinePlan = async (req, res) => {
  try {
    const { planContent, issues } = req.body;
    const result = await refinePlan(planContent, issues);
    res.json({ refinedContent: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to refine plan" });
  }
};

export const handleEnhancePlan = async (req, res) => {
  try {
    const { content, annotations } = req.body;
    const enhancedContent = await enhancePlan(content, annotations);

    if (!enhancedContent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to enhance plan" });
    }
    res.json({ success: true, content: enhancedContent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
