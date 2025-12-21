import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateArticleInput, UpdateArticleInput } from "../lib/validation";
import { createActivityLog } from "./activityService";

export interface ListArticlesFilters {
  search?: string;
  authorId?: string;
  status?: "Draft" | "Published" | "Scheduled" | ("Draft" | "Published" | "Scheduled")[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  onlyPublished?: boolean;
  sort?: "recent" | "popular";
  page?: number;
  limit?: number;
}

export interface ArticlesListResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listArticles(filters: ListArticlesFilters = {}): Promise<ArticlesListResponse> {
  const {
    search,
    authorId,
    status,
    tags,
    dateFrom,
    dateTo,
    onlyPublished = true,
    sort = "recent",
    page = 1,
    limit = 20,
  } = filters;

  // Use FTS5 search if query length >= 2
  if (search && search.length >= 2) {
    const offset = (page - 1) * limit;
    return searchArticlesFTS(search, limit, offset, onlyPublished);
  }

  const where: Prisma.ArticleWhereInput = {};

  // Fallback search query for short queries (< 2 chars) or non-FTS
  if (search && search.length < 2) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { content: { contains: search } },
    ];
  }

  // Author filter
  if (authorId) {
    where.authorId = authorId;
  }

  // Status filter
  if (status) {
    if (Array.isArray(status)) {
      where.status = { in: status };
    } else {
      where.status = status;
    }
  } else if (onlyPublished) {
    // Public users only see Published articles
    where.status = "Published";
    where.publishedAt = { not: null };
  }
  // If onlyPublished is false and no status specified, show all statuses (for /my endpoint)

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  // Tags filter (placeholder - would need a separate Tag model for full implementation)
  // For now, we'll skip tags as they require a separate model

  // Sort order
  const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [];
  if (sort === "popular") {
    orderBy.push({ views: "desc" });
    orderBy.push({ createdAt: "desc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  // Get comment counts from database (excluding soft-deleted comments)
  const items = await Promise.all(
    articles.map(async (article) => {
      const activeComments = await prisma.comment.count({
        where: {
          articleId: article.id,
          deletedAt: null,
        },
      });

      return {
        ...article,
        _count: {
          ...article._count,
          comments: activeComments,
        },
      };
    })
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getArticleById(
  id: string,
  includeAuthor = true,
  preview = false,
  userId?: string
) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: includeAuthor
        ? {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              headline: true,
              isVerified: true,
            },
          }
        : false,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  // If not preview mode, check if user can view the article
  if (!preview) {
    if (
      article.status !== "Published" &&
      article.authorId !== userId
    ) {
      throw new Error("Article not found");
    }
  } else {
    // Preview mode: only owner or admin can preview drafts
    if (article.authorId !== userId) {
      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : null;
      if (!user || user.role !== "Admin") {
        throw new Error("Not authorized to preview this article");
      }
    }
  }

  // Get actual comment count (excluding soft-deleted comments) - always calculate from database
  const activeComments = await prisma.comment.count({
    where: {
      articleId: id,
      deletedAt: null,
    },
  });
  // Always set comment count from database (excluding soft-deleted comments)
  // Type assertion needed because Prisma's _count type doesn't include comments in select
  const articleWithCount = article as typeof article & {
    _count: { likes: number; comments: number };
  };
  articleWithCount._count = {
    likes: article._count?.likes || 0,
    comments: activeComments,
  };

  return articleWithCount;
}

export async function incrementArticleView(
  articleId: string,
  userId?: string,
  ip?: string
) {
  // Don't count views from the author
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (article && article.authorId !== userId) {
    // Increment view count
    await prisma.article.update({
      where: { id: articleId },
      data: { views: { increment: 1 } },
    });

    // Track detailed view (optional)
    if (userId || ip) {
      await prisma.articleView.create({
        data: {
          articleId,
          userId: userId || null,
          ip: ip || null,
        },
      });
    }
  }
}

export async function createArticle(
  data: CreateArticleInput,
  authorId: string,
  userRole: string
) {
  // Determine status and publishedAt
  const status = data.status || "Draft";
  const isAdminOrEditor = userRole === "Admin" || userRole === "Editor";

  // Only Admin/Editor can publish or schedule
  if (
    (status === "Published" || status === "Scheduled") &&
    !isAdminOrEditor
  ) {
    throw new Error("Only Admin or Editor can publish or schedule articles");
  }

  // Validate scheduledFor for Scheduled status
  if (status === "Scheduled") {
    if (!data.scheduledFor) {
      throw new Error("scheduledFor is required when status is Scheduled");
    }
    const scheduledDate = new Date(data.scheduledFor);
    if (scheduledDate <= new Date()) {
      throw new Error("scheduledFor must be in the future");
    }
  }

  // Set publishedAt for Published status
  let publishedAt: Date | null = null;
  if (status === "Published") {
    publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
  }

  const article = await prisma.article.create({
    data: {
      title: data.title,
      summary: data.summary,
      content: data.content,
      status,
      publishedAt,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      isFeatured: data.isFeatured || false,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Update user articles count
  await prisma.user.update({
    where: { id: authorId },
    data: { articlesCount: { increment: 1 } },
  });

  // Create activity log
  await createActivityLog(authorId, "article_created", article.id);

  return article;
}

export async function updateArticle(
  id: string,
  data: UpdateArticleInput,
  userId: string,
  userRole: string,
  isAdmin = false
) {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  // Check ownership
  if (article.authorId !== userId && !isAdmin) {
    throw new Error("Not authorized to update this article");
  }

  const isAdminOrEditor = userRole === "Admin" || userRole === "Editor";
  const updateData: Prisma.ArticleUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.isFeatured !== undefined && isAdmin) {
    updateData.isFeatured = data.isFeatured;
  }

  // Handle status changes
  if (data.status !== undefined) {
    const newStatus = data.status as "Draft" | "Published" | "Scheduled";

    // Only Admin/Editor can publish or schedule
    if (
      (newStatus === "Published" ||
        newStatus === "Scheduled") &&
      !isAdminOrEditor
    ) {
      throw new Error("Only Admin or Editor can publish or schedule articles");
    }

    updateData.status = newStatus;

    // Handle scheduledFor for Scheduled status
    if (newStatus === "Scheduled") {
      if (!data.scheduledFor) {
        throw new Error("scheduledFor is required when status is Scheduled");
      }
      const scheduledDate = new Date(data.scheduledFor);
      if (scheduledDate <= new Date()) {
        throw new Error("scheduledFor must be in the future");
      }
      updateData.scheduledFor = scheduledDate;
    } else {
      updateData.scheduledFor = null;
    }

    // Handle publishedAt for Published status
    if (newStatus === "Published") {
      updateData.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : article.publishedAt || new Date();
    } else if (newStatus === "Draft") {
      updateData.publishedAt = null;
    }
  } else if (data.scheduledFor !== undefined) {
    updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
  }

  return prisma.article.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function deleteArticle(id: string, userId: string, isAdmin = false) {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  // Check ownership
  if (article.authorId !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this article");
  }

  // Update user articles count
  await prisma.user.update({
    where: { id: article.authorId },
    data: { articlesCount: { decrement: 1 } },
  });

  return prisma.article.delete({
    where: { id },
  });
}

/**
 * Search articles using SQLite FTS5
 * Only searches when query length >= 2
 */
export async function searchArticlesFTS(
  query: string,
  limit = 20,
  offset = 0,
  onlyPublished = true
): Promise<ArticlesListResponse> {
  // Guard: only search if query length >= 2
  if (!query || query.length < 2) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 0,
    };
  }

  // Escape special FTS5 characters and prepare search query
  // FTS5 uses double quotes for phrases, * for prefix matching
  const escapedQuery = query
    .replace(/"/g, '""') // Escape double quotes
    .replace(/'/g, "''") // Escape single quotes for SQL
    .trim();

  // Build WHERE clause for published articles
  const publishedWhere = onlyPublished
    ? "AND a.status = 'Published' AND a.publishedAt IS NOT NULL"
    : "";

  // FTS5 search query with title priority
  // Strategy: Search both title and summary using FTS, but prioritize title matches
  // We check if title contains the query and boost those results
  const ftsQuery = `
    SELECT 
      a.id,
      CASE 
        WHEN LOWER(a.title) LIKE LOWER('%${escapedQuery.replace(/'/g, "''")}%') THEN 
          bm25(articles_fts) - 1000.0  -- Heavily boost title matches (lower bm25 = better rank)
        ELSE 
          bm25(articles_fts)            -- Regular summary matches
      END AS rank,
      CASE 
        WHEN LOWER(a.title) LIKE LOWER('%${escapedQuery.replace(/'/g, "''")}%') THEN 1
        ELSE 0
      END AS titleMatch
    FROM articles_fts
    JOIN "Article" a ON a.id = articles_fts.articleId
    WHERE articles_fts MATCH '${escapedQuery}' ${publishedWhere}
    ORDER BY titleMatch DESC, rank ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Count query for total results
  const countQuery = `
    SELECT COUNT(*) as total
    FROM articles_fts
    JOIN "Article" a ON a.id = articles_fts.articleId
    WHERE articles_fts MATCH '${escapedQuery}' ${publishedWhere}
  `;

  try {
    // Execute search query
    const results = await prisma.$queryRawUnsafe<Array<{ id: string; rank: number }>>(ftsQuery);

    // Execute count query
    const countResult = await prisma.$queryRawUnsafe<Array<{ total: number }>>(countQuery);
    const total = Number(countResult[0]?.total || 0);

    // Get full article data with relations
    const articleIds = results.map((r) => r.id);
    if (articleIds.length === 0) {
      return {
        items: [],
        total: 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: 0,
      };
    }

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Get comment counts for each article
    const articlesWithCommentCounts = await Promise.all(
      articles.map(async (article) => {
        const activeComments = await prisma.comment.count({
          where: {
            articleId: article.id,
            deletedAt: null,
          },
        });

        return {
          ...article,
          _count: {
            ...article._count,
            comments: activeComments,
          },
        };
      })
    );

    // Maintain FTS ranking order
    const rankedArticles = articleIds
      .map((id: string) => articlesWithCommentCounts.find((a) => a.id === id))
      .filter((a) => a !== undefined) as typeof articlesWithCommentCounts;

    const page = Math.floor(offset / limit) + 1;

    return {
      items: rankedArticles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("FTS search error:", error);
    // Fallback to regular search if FTS fails
    return listArticles({
      search: query,
      onlyPublished,
      limit,
      page: Math.floor(offset / limit) + 1,
    });
  }
}

