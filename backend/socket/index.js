import { Server } from "socket.io";
import * as RoomController from "./controllers/roomController.js";
import * as CursorController from "./controllers/cursorController.js";
import * as CommentController from "./controllers/commentController.js";
import * as PlanController from "./controllers/planController.js";
import * as AnnotationController from "./controllers/annotationController.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join_room", (data) => RoomController.joinRoom(io, socket, data));

    socket.on("cursor_move", (data) =>
      CursorController.moveCursor(io, socket, data),
    );

    socket.on("add_comment", (data) =>
      CommentController.addComment(io, socket, data),
    );

    socket.on("update_plan", (data) =>
      PlanController.updatePlan(io, socket, data),
    );

    socket.on("add_annotation", (data) =>
      AnnotationController.addAnnotation(io, socket, data),
    );

    socket.on("delete_annotation", (data) =>
      AnnotationController.deleteAnnotation(io, socket, data),
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
