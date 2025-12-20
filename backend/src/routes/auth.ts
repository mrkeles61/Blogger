import { Router, Response } from "express";
import { findUserByEmail, verifyPassword } from "../services/authService";
import { signToken } from "../lib/jwt";
import { loginSchema } from "../lib/validation";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const authRouter = Router();

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "auth_token";
const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // Only secure in production (HTTPS required)
  sameSite: (isProduction ? "strict" : "lax") as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: "/", // Ensure cookie is available for all paths
  // Don't set domain in dev - allows localhost and 127.0.0.1 to work
  ...(isProduction && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

// POST /api/auth/login
authRouter.post(
  "/login",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log("[AUTH DEBUG] Login attempt - email:", req.body.email);
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    console.log("[AUTH DEBUG] User found:", user ? "YES" : "NO");
    if (!user) {
      console.log("[AUTH DEBUG] User not found - returning 401");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("[AUTH DEBUG] Verifying password...");
    const isValid = await verifyPassword(password, user.passwordHash);
    console.log("[AUTH DEBUG] Password valid:", isValid);
    if (!isValid) {
      console.log("[AUTH DEBUG] Invalid password - returning 401");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    console.log("[AUTH DEBUG] Token created, setting cookie...");
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    console.log("[AUTH DEBUG] Login successful for:", user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// POST /api/auth/logout
authRouter.post("/logout", (req, res) => {
  // Use same options for clearing cookie
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax") as const,
    path: "/",
    ...(isProduction && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
      },
    });
  })
);

