import { Router, Response } from "express";
import {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  incrementArticleView,
} from "../services/articlesService";
import { createArticleSchema, updateArticleSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const articlesRouter = Router();

// GET /api/articles with advanced filters (public)
articlesRouter.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const filters = {
      search: req.query.query as string | undefined,
      authorId: req.query.authorId as string | undefined,
      status: req.query.status
        ? (Array.isArray(req.query.status)
            ? req.query.status
            : [req.query.status]) as ("Draft" | "Published" | "Scheduled")[]
        : undefined,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      onlyPublished: req.query.status ? false : req.query.includeDrafts !== "true" || !req.user || (req.user.role !== "Admin" && req.user.role !== "Editor"),
      sort: (req.query.sort as "recent" | "popular") || "recent",
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await listArticles(filters);
    res.json(result);
  })
);

// GET /api/articles/my (protected - current user's articles)
articlesRouter.get(
  "/my",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await listArticles({ authorId: userId, onlyPublished: false });
    res.json(result);
  })
);

// GET /api/articles/:id (public, with preview support)
articlesRouter.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const preview = req.query.preview === "true";
    const userId = req.user?.id;

    const article = await getArticleById(id, true, preview, userId);

    // Increment view count (unless it's the author)
    if (!preview && article.status === "Published") {
      const ip = req.ip || (req.headers["x-forwarded-for"] as string);
      await incrementArticleView(id, userId, ip);
      // Refresh article to get updated view count (comment count is always recalculated from DB)
      const updated = await getArticleById(id, true, false, userId);
      return res.json(updated);
    }

    res.json(article);
  })
);

// POST /api/articles (protected - any authenticated user)
articlesRouter.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createArticleSchema.parse(req.body);
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const article = await createArticle(validatedData, userId, userRole);
    res.status(201).json(article);
  })
);

// PUT /api/articles/:id (protected - owner or Admin)
articlesRouter.put(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const isAdmin = userRole === "Admin";
    const validatedData = updateArticleSchema.parse(req.body);
    const article = await updateArticle(id, validatedData, userId, userRole, isAdmin);
    res.json(article);
  })
);

// DELETE /api/articles/:id (protected - owner or Admin)
articlesRouter.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "Admin";
    await deleteArticle(id, userId, isAdmin);
    res.status(204).send();
  })
);
