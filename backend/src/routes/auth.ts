import { Router, Response } from "express";
import { findUserByEmail, verifyPassword } from "../services/authService";
import { signToken } from "../lib/jwt";
import { loginSchema } from "../lib/validation";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const authRouter = Router();

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// POST /api/auth/login
authRouter.post(
  "/login",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

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
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
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

