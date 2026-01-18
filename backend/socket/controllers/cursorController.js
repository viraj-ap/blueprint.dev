export const moveCursor = (
  io,
  socket,
  { sessionId, userId, x, y, name, color },
) => {
  socket.to(sessionId).emit("cursor_move", { userId, x, y, name, color });
};
