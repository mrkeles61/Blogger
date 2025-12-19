import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

export const searchRouter = Router();

// GET /api/search/suggestions?q=...
searchRouter.get(
  "/suggestions",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.json({ articles: [], authors: [] });
    }

    // Get top 5 matching articles
    const articles = await prisma.article.findMany({
      where: {
        status: "Published",
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get top 5 matching authors
    const authors = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { displayName: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
      take: 5,
    });

    res.json({ articles, authors });
  })
);

