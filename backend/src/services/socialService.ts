import { prisma } from "../lib/prisma";
import { createActivityLog } from "./activityService";

export async function likeArticle(userId: string, articleId: string) {
  // Check if already liked
  const existing = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  if (existing) {
    return existing; // Already liked
  }

  const like = await prisma.like.create({
    data: {
      userId,
      articleId,
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

  // Create activity log
  await createActivityLog(userId, "article_liked", articleId);

  // Create notification for article author
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (article && article.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: article.authorId,
        type: "like",
        payload: JSON.stringify({
          articleId,
          likerId: userId,
          likerName: like.user.displayName || like.user.username,
        }),
      },
    });
  }

  return like;
}

export async function unlikeArticle(userId: string, articleId: string) {
  return prisma.like.delete({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
}

export async function getArticleLikes(articleId: string) {
  return prisma.like.findMany({
    where: { articleId },
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
    orderBy: { createdAt: "desc" },
  });
}

export async function hasUserLiked(userId: string, articleId: string) {
  const like = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
  return !!like;
}

export async function addComment(
  userId: string,
  articleId: string,
  content: string
) {
  const comment = await prisma.comment.create({
    data: {
      userId,
      articleId,
      content,
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

  // Create activity log
  await createActivityLog(userId, "comment_added", articleId, {
    commentId: comment.id,
  });

  // Create notification for article author
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (article && article.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: article.authorId,
        type: "comment",
        payload: JSON.stringify({
          articleId,
          commentId: comment.id,
          commenterId: userId,
          commenterName: comment.user.displayName || comment.user.username,
        }),
      },
    });
  }

  return comment;
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
) {
  // Check ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("Not authorized to edit this comment");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
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

export async function deleteComment(commentId: string, userId: string, isAdmin = false) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this comment");
  }

  // Soft delete
  return prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
}

export async function getArticleComments(articleId: string) {
  return prisma.comment.findMany({
    where: {
      articleId,
      deletedAt: null,
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
    orderBy: { createdAt: "asc" },
  });
}

export async function bookmarkArticle(userId: string, articleId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId,
      articleId,
    },
    include: {
      article: {
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
      },
    },
  });

  await createActivityLog(userId, "article_bookmarked", articleId);

  return bookmark;
}

export async function unbookmarkArticle(userId: string, articleId: string) {
  return prisma.bookmark.delete({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
}

export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: {
      article: {
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
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });

  // Update stats
  await Promise.all([
    prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: followingId },
      data: { followersCount: { increment: 1 } },
    }),
  ]);

  // Create notification
  await prisma.notification.create({
    data: {
      userId: followingId,
      type: "follow",
      payload: JSON.stringify({
        followerId,
      }),
    },
  });

  await createActivityLog(followerId, "user_followed", followingId);

  return follow;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const follow = await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  // Update stats
  await Promise.all([
    prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: followingId },
      data: { followersCount: { decrement: 1 } },
    }),
  ]);

  return follow;
}

export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  return !!follow;
}

export async function getUserFollowers(userId: string) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          headline: true,
          isVerified: true,
          followersCount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserFollowing(userId: string) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          headline: true,
          isVerified: true,
          followersCount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

