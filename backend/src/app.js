import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import itemRoutes from "./routes/item.routes.js";
import searchRoutes from "./routes/search.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import resurfaceRouter from "./routes/resurface.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import rateLimit from "express-rate-limit";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        "http://localhost:5173",
      ];

      // Allow requests with no origin (like mobile apps or curl) or from Chrome extensions
      if (!origin || origin.startsWith("chrome-extension://")) return callback(null, true);

      // Check if origin (ignoring trailing slash) is in allowed list
      const sanitizedOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(allowed =>
        allowed && allowed.replace(/\/$/, "") === sanitizedOrigin
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        // Log blocked origin for easier production debugging
        console.warn(`CORS: Blocked origin ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many attempts, try later" },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many requests, slow down" },
});

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    return res.status(200).json({ status: "ok", db: "connected" });
  }
  return res.status(503).json({ status: "degraded", db: "disconnected" });
});

app.use("/api/items", aiLimiter, itemRoutes);
app.use("/api/search", aiLimiter, searchRoutes);
app.use("/api/collections", aiLimiter, collectionRoutes);
app.use("/api/resurface", resurfaceRouter);
app.use("/api/stats", statsRoutes);

export default app;
