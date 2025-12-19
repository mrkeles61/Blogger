import { prisma } from "../lib/prisma";

export async function addCollaborator(
  articleId: string,
  userId: string,
  role: "CoAuthor" | "Reviewer",
  addedById: string
) {
  // Verify article ownership or admin
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, displayName: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if already a collaborator
  const existing = await prisma.articleCollaborator.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  });

  if (existing) {
    // Update role
    return prisma.articleCollaborator.update({
      where: { id: existing.id },
      data: { role },
      include: {
        user: {
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

  const collaborator = await prisma.articleCollaborator.create({
    data: {
      articleId,
      userId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Send notification to the invited user
  const articleWithTitle = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "collaborator_invite",
      payload: JSON.stringify({
        articleId,
        articleTitle: articleWithTitle?.title || "Article",
        role,
        addedById,
      }),
    },
  });

  return collaborator;
}

export async function removeCollaborator(
  articleId: string,
  userId: string,
  removedById: string
) {
  const collaborator = await prisma.articleCollaborator.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  });

  if (!collaborator) {
    throw new Error("Collaborator not found");
  }

  await prisma.articleCollaborator.delete({
    where: { id: collaborator.id },
  });

  return { success: true };
}

export async function getArticleCollaborators(articleId: string) {
  return prisma.articleCollaborator.findMany({
    where: { articleId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          headline: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function canEditArticle(
  articleId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  // Admin can always edit
  if (userRole === "Admin") {
    return true;
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (!article) {
    return false;
  }

  // Author can edit
  if (article.authorId === userId) {
    return true;
  }

  // Check if user is a CoAuthor
  const collaborator = await prisma.articleCollaborator.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  });

  return collaborator?.role === "CoAuthor";
}

export async function canReviewArticle(
  articleId: string,
  userId: string
): Promise<boolean> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      collaborators: {
        where: {
          userId,
          role: { in: ["CoAuthor", "Reviewer"] },
        },
      },
    },
  });

  if (!article) {
    return false;
  }

  // Author can review
  if (article.authorId === userId) {
    return true;
  }

  // CoAuthor or Reviewer can review
  return article.collaborators.length > 0;
}

