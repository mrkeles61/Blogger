import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ Error: JWT_SECRET environment variable is required");
  console.error("📝 Please create a .env file in the backend/ directory with:");
  console.error("   JWT_SECRET=your-secret-key-here");
  console.error("   DATABASE_URL=file:./prisma/dev.db");
  console.error("   PORT=4000");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { articlesRouter } from "./routes/articles";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { socialRouter } from "./routes/social";
import { feedRouter } from "./routes/feed";
import { searchRouter } from "./routes/search";
import { analyticsRouter } from "./routes/analytics";
import { collaborationRouter } from "./routes/collaboration";
import { moderationRouter } from "./routes/moderation";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import { publishDueArticles } from "./services/publishScheduler";

const app = express();
const PORT = process.env.PORT || 4000;

// Enhanced logging
console.log("🚀 Starting Bilfen Blog Backend...");
console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Missing"}`);
console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL || "file:./prisma/dev.db"}`);
console.log(`🌐 PORT: ${PORT}`);

// Test Prisma connection on startup
console.log("🔌 Connecting to database...");
prisma.$connect()
  .then(() => {
    console.log("✅ Database connection successful");
  })
  .catch((err: unknown) => {
    console.error("❌ Failed to connect to database:", err);
    console.error("📝 Please ensure DATABASE_URL is set correctly in .env file");
    console.error("💡 Example: DATABASE_URL=file:./prisma/dev.db");
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
app.use("/api/search", searchRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api", collaborationRouter);
app.use("/api/moderation", moderationRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start publish scheduler (check every 5 minutes)
const SCHEDULER_INTERVAL = parseInt(process.env.SCHEDULER_INTERVAL || "300000", 10); // 5 minutes default

setInterval(async () => {
  try {
    const published = await publishDueArticles();
    if (published > 0) {
      console.log(`Published ${published} scheduled article(s)`);
    }
  } catch (error) {
    console.error("Error in publish scheduler:", error);
  }
}, SCHEDULER_INTERVAL);

console.log(`⏰ Publish scheduler running (interval: ${SCHEDULER_INTERVAL}ms)`);

// Enhanced error handling for server startup
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

// Log server errors
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("❌ Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`⚠️  Port ${PORT} is already in use. Please stop the other process or change PORT in .env`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    prisma.$disconnect().then(() => {
      console.log("✅ Database disconnected");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    prisma.$disconnect().then(() => {
      console.log("✅ Database disconnected");
      process.exit(0);
    });
  });
});

// Log unhandled errors
process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
});

