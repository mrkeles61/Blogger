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
  content: string,
  parentId?: string
) {
  const comment = await prisma.comment.create({
    data: {
      userId,
      articleId,
      content,
      parentId: parentId || null,
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
      parent: parentId
        ? {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                },
              },
            },
          }
        : undefined,
    },
  });

  // Create activity log
  await createActivityLog(userId, "comment_added", articleId, {
    commentId: comment.id,
  });

  // Handle notifications
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  const commenterName = comment.user.displayName || comment.user.username;

  // If it's a reply, notify the parent comment author
  if (parentId && comment.parent) {
    const parentCommentAuthorId = comment.parent.userId;
    if (parentCommentAuthorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: parentCommentAuthorId,
          type: "comment_reply",
          payload: JSON.stringify({
            articleId,
            commentId: comment.id,
            parentCommentId: parentId,
            commenterId: userId,
            commenterName,
          }),
        },
      });
    }
  }

  // Notify article author (unless it's their own comment or a reply they're already notified about)
  if (article && article.authorId !== userId) {
    if (!parentId || (comment.parent && comment.parent.userId !== article.authorId)) {
      await prisma.notification.create({
        data: {
          userId: article.authorId,
          type: "comment",
          payload: JSON.stringify({
            articleId,
            commentId: comment.id,
            commenterId: userId,
            commenterName,
          }),
        },
      });
    }
  }

  // Handle @mentions in content
  handleMentions(content, articleId, userId, comment.id).catch((err) => {
    console.error("Error handling mentions:", err);
  });

  // Get updated comment count for the article
  const commentCount = await prisma.comment.count({
    where: {
      articleId,
      deletedAt: null,
    },
  });

  return {
    ...comment,
    articleCommentCount: commentCount,
  };
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

  console.log(`[DEBUG] Deleting comment ${commentId}, current deletedAt: ${comment.deletedAt}`);

  // Soft delete
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  console.log(`[DEBUG] Comment ${commentId} soft deleted, new deletedAt: ${updated.deletedAt}`);

  // Get updated comment count for the article
  const commentCount = await prisma.comment.count({
    where: {
      articleId: comment.articleId,
      deletedAt: null,
    },
  });

  console.log(`[DEBUG] Article ${comment.articleId} comment count after delete: ${commentCount}`);

  return {
    articleId: comment.articleId,
    commentCount,
  };
}

export async function getArticleComments(articleId: string) {
  const comments = await prisma.comment.findMany({
    where: {
      articleId,
      deletedAt: null,
      parentId: null, // Only top-level comments
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
      replies: {
        where: { deletedAt: null },
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
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments;
}

export async function getCommentReplies(commentId: string) {
  return prisma.comment.findMany({
    where: {
      parentId: commentId,
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

async function handleMentions(
  content: string,
  articleId: string,
  commenterId: string,
  commentId: string
) {
  // Extract @mentions from content (simple regex for @username)
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  // Find mentioned users
  for (const username of mentions) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (user && user.id !== commenterId) {
      // Create notification for mentioned user
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "mention",
          payload: JSON.stringify({
            articleId,
            commentId,
            commenterId,
          }),
        },
      });
    }
  }
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

