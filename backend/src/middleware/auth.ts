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
    console.log("[AUTH DEBUG] authenticate middleware called");
    console.log("[AUTH DEBUG] Request URL:", req.url);
    console.log("[AUTH DEBUG] Request cookies:", req.cookies);
    console.log("[AUTH DEBUG] Cookie name looking for:", COOKIE_NAME);
    console.log("[AUTH DEBUG] Cookie exists?", req.cookies && req.cookies[COOKIE_NAME] ? "YES" : "NO");
    console.log("[AUTH DEBUG] Authorization header:", req.headers.authorization ? "EXISTS" : "MISSING");
    
    let token: string | undefined;

    // Try to get token from cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
      console.log("[AUTH DEBUG] Token found in cookie, length:", token.length);
    }
    // Try to get token from Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("[AUTH DEBUG] Token found in Authorization header");
      }
    }

    if (!token) {
      console.log("[AUTH DEBUG] No token found - returning 401");
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("[AUTH DEBUG] Verifying token...");
    const payload = verifyToken(token);
    console.log("[AUTH DEBUG] Token verified, payload:", payload);
    const user = await findUserById(payload.userId);
    console.log("[AUTH DEBUG] User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("[AUTH DEBUG] User not found - returning 401");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    console.log("[AUTH DEBUG] Authentication successful, user:", req.user.email);
    next();
  } catch (error) {
    console.error("[AUTH DEBUG] Authentication error:", error);
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

