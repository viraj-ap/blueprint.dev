import "dotenv/config";
import http from "http";
import connectDB from "./lib/db.js";
import app from "./app.js";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
