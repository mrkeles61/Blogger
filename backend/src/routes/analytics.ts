import { Router, Response } from "express";
import {
  getTopArticles,
  getUserAnalytics,
  getActivityAnalytics,
} from "../services/analyticsService";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const analyticsRouter = Router();

// GET /api/analytics/articles (admin only)
analyticsRouter.get(
  "/articles",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const articles = await getTopArticles(limit);
    res.json(articles);
  })
);

// GET /api/analytics/user/:id
analyticsRouter.get(
  "/user/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "Admin";

    // Users can only view their own analytics unless admin
    if (id !== userId && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const analytics = await getUserAnalytics(id);
    res.json(analytics);
  })
);

// GET /api/analytics/activity (admin only)
analyticsRouter.get(
  "/activity",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const activity = await getActivityAnalytics(days);
    res.json(activity);
  })
);

