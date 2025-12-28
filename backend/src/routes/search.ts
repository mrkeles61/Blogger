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

    // Detect if running on PostgreSQL (production) or SQLite (local)
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql');
    const searchFilter = isPostgres
      ? { contains: query, mode: 'insensitive' as const }
      : { contains: query };

    // Get top 5 matching articles
    const articles = await prisma.article.findMany({
      where: {
        status: "Published",
        OR: [
          { title: searchFilter },
          { summary: searchFilter },
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
          { username: searchFilter },
          { displayName: searchFilter },
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

