import Session from "../models/Session.js";
import { v4 as uuidv4 } from "uuid";
import { generatePlan } from "../services/geminiService.js";

export const createSession = async (req, res) => {
  try {
    const { projectTitle, steps } = req.body;
    const sessionId =
      uuidv4().split("-")[0] + "-" + Date.now().toString().slice(-4);

    const formattedSteps = steps.map((s) => ({
      ...s,
      id: s.id || uuidv4(),
      status: "pending",
    }));

    const newSession = new Session({
      sessionId,
      projectTitle,
      steps: formattedSteps,
      activeUsers: [],
      comments: [],
    });

    await newSession.save();
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createSessionFromMarkdown = async (req, res) => {
  try {
    const { content, projectTitle } = req.body;
    const sessionId =
      uuidv4().split("-")[0] + "-" + Date.now().toString().slice(-4);

    const newSession = new Session({
      sessionId,
      projectTitle: projectTitle || "Uploaded Plan",
      content: content || "",
      steps: [],
      activeUsers: [],
      comments: [],
    });

    await newSession.save();
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error("Error creating session from markdown:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const generateSession = async (req, res) => {
  try {
    const { prompt } = req.body;
    const planData = await generatePlan(prompt);

    if (!planData) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate plan" });
    }

    const sessionId =
      uuidv4().split("-")[0] + "-" + Date.now().toString().slice(-4);

    const newSession = new Session({
      sessionId,
      projectTitle: planData.projectTitle || "AI Generated Plan",
      content: planData.content || "",
      steps: [],
      activeUsers: [],
      comments: [],
    });

    await newSession.save();
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ success: false });
  }
};
