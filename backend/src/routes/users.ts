import { Router, Response } from "express";
import {
  getUserById,
  getUserByUsername,
  listUsers,
  updateUserProfile,
  getUserArticles,
} from "../services/usersService";
import { updateProfileSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const usersRouter = Router();

// GET /api/users (public, with search)
usersRouter.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const search = req.query.search as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await listUsers(search, limit, offset);
    res.json(result);
  })
);

// GET /api/users/:id (public)
usersRouter.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    let user;

    // Try by ID first, then by username
    try {
      user = await getUserById(id);
    } catch {
      try {
        user = await getUserByUsername(id);
      } catch {
        return res.status(404).json({ message: "User not found" });
      }
    }

    res.json(user);
  })
);

// GET /api/users/:id/articles (public)
usersRouter.get(
  "/:id/articles",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const includeDrafts = req.query.includeDrafts === "true";
    const isAdmin = req.user?.role === "Admin";

    // Get user first to validate
    try {
      await getUserById(id);
    } catch {
      try {
        const user = await getUserByUsername(id);
        const articles = await getUserArticles(user.id, includeDrafts || isAdmin);
        return res.json(articles);
      } catch {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const articles = await getUserArticles(id, includeDrafts || isAdmin);
    res.json(articles);
  })
);

// PUT /api/users/:id (protected - self or admin)
usersRouter.put(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "Admin";

    // Check if user is updating their own profile or is admin
    if (id !== userId && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(id, validatedData, isAdmin);

    res.json(user);
  })
);

// GET /api/users/:id/followers (public)
usersRouter.get(
  "/:id/followers",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { getUserFollowers } = await import("../services/socialService");

    // Get user first
    try {
      await getUserById(id);
    } catch {
      try {
        const user = await getUserByUsername(id);
        const followers = await getUserFollowers(user.id);
        return res.json(followers);
      } catch {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const followers = await getUserFollowers(id);
    res.json(followers);
  })
);

// GET /api/users/:id/following (public)
usersRouter.get(
  "/:id/following",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { getUserFollowing } = await import("../services/socialService");

    // Get user first
    try {
      await getUserById(id);
    } catch {
      try {
        const user = await getUserByUsername(id);
        const following = await getUserFollowing(user.id);
        return res.json(following);
      } catch {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const following = await getUserFollowing(id);
    res.json(following);
  })
);

