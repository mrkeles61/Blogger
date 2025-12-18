import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { findUserById } from "../services/authService";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "auth_token";

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // Try to get token from cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }
    // Try to get token from Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
}

