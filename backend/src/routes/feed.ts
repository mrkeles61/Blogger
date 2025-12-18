import { Router, Response } from "express";
import { getActivityFeed, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/activityService";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

export const feedRouter = Router();

// GET /api/feed (protected - current user's feed)
feedRouter.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const feed = await getActivityFeed(userId, limit);
    res.json(feed);
  })
);

// GET /api/notifications (protected)
feedRouter.get(
  "/notifications",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const unreadOnly = req.query.unreadOnly === "true";

    const notifications = await getUserNotifications(userId, unreadOnly);
    res.json(notifications);
  })
);

// PUT /api/notifications/:id/read (protected)
feedRouter.put(
  "/notifications/:id/read",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await markNotificationAsRead(id, userId);
    res.json(notification);
  })
);

// PUT /api/notifications/read-all (protected)
feedRouter.put(
  "/notifications/read-all",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    await markAllNotificationsAsRead(userId);
    res.json({ message: "All notifications marked as read" });
  })
);

