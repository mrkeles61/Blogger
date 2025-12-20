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

export async function listArticles(filters: ListArticlesFilters = {}) {
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

  const where: Prisma.ArticleWhereInput = {};

  // Search query (title, summary, content)
  if (search) {
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

  const [items, total] = await Promise.all([
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
            comments: true,
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

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
    include: includeAuthor
      ? {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              headline: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        }
      : undefined,
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

  // Get actual comment count (excluding soft-deleted comments) - always calculate
  const totalComments = await prisma.comment.count({
    where: {
      articleId: id,
    },
  });
  const activeComments = await prisma.comment.count({
    where: {
      articleId: id,
      deletedAt: null,
    },
  });
  // Initialize _count if it doesn't exist
  if (!article._count) {
    article._count = { likes: (article as any)._count?.likes || 0, comments: 0 };
  }
  article._count.comments = activeComments;
  console.log(`[DEBUG] Article ${id} - Total comments: ${totalComments}, Active (not deleted): ${activeComments}`);

  return article;
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

