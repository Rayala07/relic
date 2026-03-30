import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import searchRoutes from "./routes/search.routes.js";
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

export default app;
