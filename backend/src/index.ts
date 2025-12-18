import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { articlesRouter } from "./routes/articles";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { socialRouter } from "./routes/social";
import { feedRouter } from "./routes/feed";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("Error: JWT_SECRET environment variable is required");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Test Prisma connection on startup
prisma.$connect().catch((err: unknown) => {
  console.error("Failed to connect to database:", err);
  console.error("Please ensure DATABASE_URL is set correctly in .env file");
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Routes
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api", socialRouter);
app.use("/api", feedRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

