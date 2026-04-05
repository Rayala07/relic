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
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/resurface", resurfaceRouter);
app.use("/api/graph", graphRoutes);
app.use("/api/stats", statsRoutes);

export default app;
