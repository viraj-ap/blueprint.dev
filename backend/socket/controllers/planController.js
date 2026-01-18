export const updatePlan = (io, socket, { sessionId, markdown }) => {
  socket.to(sessionId).emit("plan_updated", { markdown });
};
