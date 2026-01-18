import Session from "../../models/Session.js";

export const joinRoom = async (io, socket, { sessionId, user }) => {
  socket.join(sessionId);
  console.log(`User ${user.name} joined room ${sessionId}`);

  try {
    let session = await Session.findOne({ sessionId });

    if (!session) {
      console.log(`Session ${sessionId} not found, creating new one.`);
      session = new Session({
        sessionId,
        activeUsers: [user],
        steps: [],
        comments: [],
        annotations: [],
      });
      await session.save();
    }

    if (session) {
      socket.emit("init_state", session);
    }
  } catch (e) {
    console.error("Error fetching session:", e);
  }
};
