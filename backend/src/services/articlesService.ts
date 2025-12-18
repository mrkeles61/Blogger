import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateArticleInput, UpdateArticleInput } from "../lib/validation";
import { createActivityLog } from "./activityService";

export async function listArticles(
  search?: string,
  authorId?: string,
  onlyPublished = true
) {
  const where: Prisma.ArticleWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { content: { contains: search } },
    ];
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (onlyPublished) {
    where.publishedAt = { not: null };
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

  return { items, total };
}

export async function getArticleById(id: string, includeAuthor = true) {
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
              comments: true,
            },
          },
        }
      : undefined,
  });

  if (!article) {
    throw new Error("Article not found");
  }

  return article;
}

export async function createArticle(data: CreateArticleInput, authorId: string) {
  const article = await prisma.article.create({
    data: {
      title: data.title,
      summary: data.summary,
      content: data.content,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
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

  const updateData: Prisma.ArticleUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
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

