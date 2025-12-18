import { Router, Response } from "express";
import {
  likeArticle,
  unlikeArticle,
  getArticleLikes,
  hasUserLiked,
  addComment,
  updateComment,
  deleteComment,
  getArticleComments,
  bookmarkArticle,
  unbookmarkArticle,
  getUserBookmarks,
  followUser,
  unfollowUser,
  isFollowing,
} from "../services/socialService";
import { commentSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

export const socialRouter = Router();

// POST /api/articles/:id/like (protected)
socialRouter.post(
  "/articles/:id/like",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const like = await likeArticle(userId, id);
    res.json(like);
  })
);

// DELETE /api/articles/:id/like (protected)
socialRouter.delete(
  "/articles/:id/like",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await unlikeArticle(userId, id);
    res.status(204).send();
  })
);

// GET /api/articles/:id/likes (public)
socialRouter.get(
  "/articles/:id/likes",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const likes = await getArticleLikes(id);
    res.json(likes);
  })
);

// GET /api/articles/:id/liked (protected - check if current user liked)
socialRouter.get(
  "/articles/:id/liked",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const liked = await hasUserLiked(userId, id);
    res.json({ liked });
  })
);

// POST /api/articles/:id/comments (protected)
socialRouter.post(
  "/articles/:id/comments",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = commentSchema.parse(req.body);

    const comment = await addComment(userId, id, content);
    res.status(201).json(comment);
  })
);

// GET /api/articles/:id/comments (public)
socialRouter.get(
  "/articles/:id/comments",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const comments = await getArticleComments(id);
    res.json(comments);
  })
);

// PUT /api/comments/:id (protected - owner only)
socialRouter.put(
  "/comments/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = commentSchema.parse(req.body);

    const comment = await updateComment(id, userId, content);
    res.json(comment);
  })
);

// DELETE /api/comments/:id (protected - owner or admin)
socialRouter.delete(
  "/comments/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "Admin";

    await deleteComment(id, userId, isAdmin);
    res.status(204).send();
  })
);

// POST /api/articles/:id/bookmark (protected)
socialRouter.post(
  "/articles/:id/bookmark",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const bookmark = await bookmarkArticle(userId, id);
    res.status(201).json(bookmark);
  })
);

// DELETE /api/articles/:id/bookmark (protected)
socialRouter.delete(
  "/articles/:id/bookmark",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await unbookmarkArticle(userId, id);
    res.status(204).send();
  })
);

// GET /api/bookmarks (protected - current user)
socialRouter.get(
  "/bookmarks",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const bookmarks = await getUserBookmarks(userId);
    res.json(bookmarks);
  })
);

// POST /api/users/:id/follow (protected)
socialRouter.post(
  "/users/:id/follow",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.id;

    const follow = await followUser(followerId, id);
    res.status(201).json(follow);
  })
);

// DELETE /api/users/:id/follow (protected)
socialRouter.delete(
  "/users/:id/follow",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.id;

    await unfollowUser(followerId, id);
    res.status(204).send();
  })
);

// GET /api/users/:id/following-status (protected - check if current user follows)
socialRouter.get(
  "/users/:id/following-status",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.id;

    const following = await isFollowing(followerId, id);
    res.json({ following });
  })
);

