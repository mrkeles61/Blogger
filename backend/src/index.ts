import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("[ERROR] JWT_SECRET environment variable is required");
  console.error("[INFO] Please create a .env file in the backend/ directory with:");
  console.error("   JWT_SECRET=your-secret-key-here");
  console.error("   DATABASE_URL=file:./prisma/dev.db");
  console.error("   PORT=4000");
  process.exit(1);
}

import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
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
const nodeEnv = process.env.NODE_ENV || "development";
console.log("[INFO] Starting Bilfen Blog Backend...");
console.log(`[INFO] Environment: ${nodeEnv}`);
console.log(`[INFO] JWT_SECRET: ${process.env.JWT_SECRET ? "[OK] Set" : "[ERROR] Missing"}`);
console.log(`[INFO] DATABASE_URL: ${process.env.DATABASE_URL || "file:./prisma/dev.db"}`);
console.log(`[INFO] PORT: ${PORT}`);
console.log(`[INFO] CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
console.log(`[INFO] Cookie Secure: ${nodeEnv === "production" ? "true (HTTPS required)" : "false (HTTP allowed)"}`);

// Test Prisma connection on startup
console.log("[INFO] Connecting to database...");
prisma.$connect()
  .then(() => {
    console.log("[OK] Database connection successful");
  })
  .catch((err: unknown) => {
    console.error("[ERROR] Failed to connect to database:", err);
    console.error("[INFO] Please ensure DATABASE_URL is set correctly in .env file");
    console.error("[TIP] Example: DATABASE_URL=file:./prisma/dev.db");
    process.exit(1);
  });

// CORS Configuration for cross-origin authentication
// IMPORTANT: CORS must be configured BEFORE other middleware (including helmet)
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
console.log(`[CORS] Configured allowed origin: ${corsOrigin}`);
console.log(`[CORS] NODE_ENV: ${process.env.NODE_ENV}`);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`[CORS] Incoming request origin: ${origin || "(no origin)"}`);

    // Allow requests with no origin (mobile apps, Postman, server-to-server, etc.)
    if (!origin) {
      console.log(`[CORS] Allowing request with no origin`);
      return callback(null, true);
    }

    // In development, allow localhost variants
    if (process.env.NODE_ENV !== "production") {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        corsOrigin,
      ];
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] Allowing dev origin: ${origin}`);
        return callback(null, true);
      }
    }

    // In production, strictly check against configured origin
    if (origin === corsOrigin) {
      console.log(`[CORS] Allowing production origin: ${origin}`);
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.error(`[CORS] BLOCKED origin: ${origin} (allowed: ${corsOrigin})`);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true, // Required for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours - cache preflight response
};

// Apply CORS middleware FIRST (before helmet and other middleware)
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options("*", cors(corsOptions));

// Now apply other middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cookieParser());
app.use(express.json());

// Rate limiting - 500 requests per 15 minutes for all environments
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", limiter);
console.log("[INFO] Rate limiting enabled: 500 requests per 15 minutes");

// Routes
app.get("/health", (req: Request, res: Response) => {
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

console.log(`[INFO] Publish scheduler running (interval: ${SCHEDULER_INTERVAL}ms)`);

// Enhanced error handling for server startup
const server = app.listen(PORT, () => {
  console.log(`[OK] Server running on http://localhost:${PORT}`);
  console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
  console.log(`[INFO] Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

// Log server errors
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("[ERROR] Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`[WARN] Port ${PORT} is already in use. Please stop the other process or change PORT in .env`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[INFO] SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("[OK] Server closed");
    prisma.$disconnect().then(() => {
      console.log("[OK] Database disconnected");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("[INFO] SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("[OK] Server closed");
    prisma.$disconnect().then(() => {
      console.log("[OK] Database disconnected");
      process.exit(0);
    });
  });
});

// Log unhandled errors
process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("[ERROR] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("[ERROR] Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
});

