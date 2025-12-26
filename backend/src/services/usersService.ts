import { prisma } from "../lib/prisma";

export interface UpdateProfileInput {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  location?: string;
  website?: string | null;
  headline?: string;
  socialLinks?: string;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      location: true,
      website: true,
      headline: true,
      socialLinks: true,
      isVerified: true,
      role: true,
      followersCount: true,
      followingCount: true,
      articlesCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get comment count from database
  const commentsCount = await prisma.comment.count({
    where: { userId: id, deletedAt: null },
  });

  return {
    ...user,
    commentsCount,
  };
}

export async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      location: true,
      website: true,
      headline: true,
      socialLinks: true,
      isVerified: true,
      role: true,
      followersCount: true,
      followingCount: true,
      articlesCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get comment count from database
  const commentsCount = await prisma.comment.count({
    where: { userId: user.id, deletedAt: null },
  });

  return {
    ...user,
    commentsCount,
  };
}

export async function listUsers(search?: string, limit = 20, offset = 0) {
  const where = search
    ? {
        OR: [
          { displayName: { contains: search } },
          { username: { contains: search } },
          { bio: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        headline: true,
        isVerified: true,
        followersCount: true,
        articlesCount: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
  isAdmin = false
) {
  // Check username uniqueness if provided
  if (data.username) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing && existing.id !== userId) {
      throw new Error("Username already taken");
    }
  }

  const updateData: any = {};
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;

  // Only admins can update role and verification
  if (isAdmin) {
    // Role and isVerified updates would go here if needed
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      location: true,
      website: true,
      headline: true,
      socialLinks: true,
      isVerified: true,
      role: true,
      followersCount: true,
      followingCount: true,
      articlesCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get comment count from database
  const commentsCount = await prisma.comment.count({
    where: { userId: userId, deletedAt: null },
  });

  return {
    ...updatedUser,
    commentsCount,
  };
}

export async function getUserArticles(userId: string, includeDrafts = false) {
  const where: any = { authorId: userId };
  if (!includeDrafts) {
    where.publishedAt = { not: null };
  }

  const articles = await prisma.article.findMany({
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
        },
      },
    },
  });

  // Get comment counts from database (excluding soft-deleted comments)
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

  return articlesWithCommentCounts;
}

export async function updateUserStats(userId: string) {
  const [articlesCount, followersCount, followingCount] = await Promise.all([
    prisma.article.count({ where: { authorId: userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return prisma.user.update({
    where: { id: userId },
    data: {
      articlesCount,
      followersCount,
      followingCount,
    },
  });
}

