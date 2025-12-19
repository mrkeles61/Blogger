import { Router, Response } from "express";
import {
  addCollaborator,
  removeCollaborator,
  getArticleCollaborators,
  canEditArticle,
  canReviewArticle,
} from "../services/collaborationService";
import { getArticleById } from "../services/articlesService";
import { createCollaboratorSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

export const collaborationRouter = Router();

// GET /api/articles/:id/collaborators
collaborationRouter.get(
  "/articles/:id/collaborators",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const collaborators = await getArticleCollaborators(id);
    res.json(collaborators);
  })
);

// POST /api/articles/:id/collaborators
collaborationRouter.post(
  "/articles/:id/collaborators",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = createCollaboratorSchema.parse(req.body);

    // Check if user can add collaborators (must be article owner or admin)
    const article = await getArticleById(id, false);
    if (article.authorId !== userId && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const collaborator = await addCollaborator(
      id,
      validatedData.userId,
      validatedData.role,
      userId
    );
    res.status(201).json(collaborator);
  })
);

// DELETE /api/articles/:id/collaborators/:userId
collaborationRouter.delete(
  "/articles/:id/collaborators/:userId",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id, userId: collaboratorId } = req.params;
    const userId = req.user!.id;

    // Check if user can remove collaborators
    const article = await getArticleById(id, false);
    if (article.authorId !== userId && req.user!.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await removeCollaborator(id, collaboratorId, userId);
    res.status(204).send();
  })
);

