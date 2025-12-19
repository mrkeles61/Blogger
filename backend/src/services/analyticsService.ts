import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export async function getTopArticles(limit = 10) {
  const articles = await prisma.article.findMany({
    where: {
      status: "Published",
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
          comments: true,
        },
      },
    },
    orderBy: [
      { views: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    views: article.views,
    likes: article._count.likes,
    comments: article._count.comments,
    author: article.author,
    createdAt: article.createdAt,
    publishedAt: article.publishedAt,
  }));
}

export async function getUserAnalytics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      followersCount: true,
      followingCount: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get article stats
  const articles = await prisma.article.findMany({
    where: { authorId: userId },
    select: {
      status: true,
      views: true,
      id: true,
    },
  });

  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const publishedCount = articles.filter((a) => a.status === "Published").length;
  const draftCount = articles.filter((a) => a.status === "Draft").length;
  const scheduledCount = articles.filter((a) => a.status === "Scheduled").length;

  // Get likes received
  const likesCount = await prisma.like.count({
    where: {
      article: {
        authorId: userId,
      },
    },
  });

  // Get follower gain over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentFollows = await prisma.follow.count({
    where: {
      followingId: userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  return {
    user,
    totalArticles: articles.length,
    publishedArticles: publishedCount,
    draftArticles: draftCount,
    scheduledArticles: scheduledCount,
    totalViews,
    totalLikes: likesCount,
    followers: user.followersCount,
    following: user.followingCount,
    followersGainedLast30Days: recentFollows,
  };
}

export async function getActivityAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Daily article creation
  const articleCreations = await prisma.activityLog.groupBy({
    by: ["createdAt"],
    where: {
      type: "article_created",
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Daily comments
  const comments = await prisma.comment.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: startDate,
      },
      deletedAt: null,
    },
    _count: {
      id: true,
    },
  });

  // Daily likes
  const likes = await prisma.like.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Aggregate by day
  const dailyStats: Record<string, { articles: number; comments: number; likes: number }> = {};

  articleCreations.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { articles: 0, comments: 0, likes: 0 };
    }
    dailyStats[date].articles += item._count.id;
  });

  comments.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { articles: 0, comments: 0, likes: 0 };
    }
    dailyStats[date].comments += item._count.id;
  });

  likes.forEach((item) => {
    const date = item.createdAt.toISOString().split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { articles: 0, comments: 0, likes: 0 };
    }
    dailyStats[date].likes += item._count.id;
  });

  return Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      ...stats,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

