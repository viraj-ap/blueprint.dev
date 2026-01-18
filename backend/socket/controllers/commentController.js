import Session from "../../models/Session.js";
import { v4 as uuidv4 } from "uuid";
import { analyzeContext } from "../../services/geminiService.js";

export const addComment = async (
  io,
  socket,
  { sessionId, stepId, content, user },
) => {
  try {
    const commentId = uuidv4();
    const newComment = {
      id: commentId,
      userId: user.id || user.name,
      stepId,
      content,
      timestamp: new Date(),
      isAiGenerated: false,
    };

    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $push: { comments: newComment } },
      { new: true },
    );

    if (!session) return;

    io.in(sessionId).emit("new_comment", { comment: newComment });

    try {
      const aiResult = await analyzeContext(session.steps, session.comments);

      if (aiResult && aiResult.shouldIntervene) {
        const botComment = {
          id: uuidv4(),
          userId: "gemini-bot",
          stepId: null,
          content: aiResult.message,
          timestamp: new Date(),
          isAiGenerated: true,
        };

        await Session.findOneAndUpdate(
          { sessionId },
          { $push: { comments: botComment } },
        );

        io.in(sessionId).emit("bot_intervention", { comment: botComment });
      }
    } catch (aiErr) {
      console.error("Error in Gemini integration:", aiErr);
    }
  } catch (e) {
    console.error("Error adding comment:", e);
  }
};
