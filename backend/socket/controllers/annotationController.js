import Session from "../../models/Session.js";
import { v4 as uuidv4 } from "uuid";

export const addAnnotation = async (io, socket, { sessionId, annotation }) => {
  try {
    if (!annotation.id) annotation.id = uuidv4();

    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $push: { annotations: annotation } },
      { new: true },
    );

    if (session) {
      socket.to(sessionId).emit("annotation_added", { annotation });
    }
  } catch (e) {
    console.error("Error adding annotation:", e);
  }
};

export const deleteAnnotation = async (
  io,
  socket,
  { sessionId, annotationId },
) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $pull: { annotations: { id: annotationId } } },
      { new: true },
    );

    if (session) {
      io.in(sessionId).emit("annotation_deleted", { annotationId });
    }
  } catch (e) {
    console.error("Error deleting annotation:", e);
  }
};
