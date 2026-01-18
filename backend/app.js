import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Static Files
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// Routes
app.use("/api", apiRoutes);

export default app;
