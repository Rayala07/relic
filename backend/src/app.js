import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import searchRoutes from "./routes/search.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import resurfaceRouter from "./routes/resurface.routes.js";
import graphRoutes from "./routes/graph.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import rateLimit from "express-rate-limit";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, try later' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests, slow down' }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/items", aiLimiter, itemRoutes);
app.use("/api/search", aiLimiter, searchRoutes);
app.use("/api/collections", aiLimiter, collectionRoutes);
app.use("/api/resurface", resurfaceRouter);
app.use("/api/graph", graphRoutes);
app.use("/api/stats", statsRoutes);

export default app;
