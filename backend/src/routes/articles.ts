import { Router, Response } from "express";
import {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../services/articlesService";
import { createArticleSchema, updateArticleSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const articlesRouter = Router();

// GET /api/articles?search=...&authorId=... (public)
articlesRouter.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const search = req.query.search as string | undefined;
    const authorId = req.query.authorId as string | undefined;
    const onlyPublished = req.query.includeDrafts !== "true" || req.user?.role !== "Admin";

    const result = await listArticles(search, authorId, onlyPublished);
    res.json(result);
  })
);

// GET /api/articles/my (protected - current user's articles)
articlesRouter.get(
  "/my",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await listArticles(undefined, userId, false);
    res.json(result);
  })
);

// GET /api/articles/:id (public)
articlesRouter.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const article = await getArticleById(id);
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
    const article = await createArticle(validatedData, userId);
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
    const isAdmin = req.user!.role === "Admin";
    const validatedData = updateArticleSchema.parse(req.body);
    const article = await updateArticle(id, validatedData, userId, isAdmin);
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
