import express from "express";
import * as SessionController from "../controllers/sessionController.js";
import * as AIController from "../controllers/aiController.js";
import {
  uploadMiddleware,
  handleImageUpload,
} from "../controllers/uploadController.js";

const router = express.Router();

// Session Routes
router.post("/session", SessionController.createSession);
router.post(
  "/session-from-markdown",
  SessionController.createSessionFromMarkdown,
);
router.post("/generate-session", SessionController.generateSession);
router.get("/session/:sessionId", SessionController.getSession);

// AI Routes
router.post("/enhance", AIController.handleEnhancePlan);
router.post("/ai/security-lens", AIController.handleSecurityAnalysis);
router.post("/ai/contradiction", AIController.handleContradictionAnalysis);
router.post("/ai/risk-label", AIController.handleRiskAssessment);
router.post("/ai/refine-plan", AIController.handleRefinePlan);

// Upload Route
router.post("/upload", uploadMiddleware.single("image"), handleImageUpload);

export default router;
