import { prisma } from "../lib/prisma";

export async function createActivityLog(
  userId: string,
  type: string,
  entityId?: string,
  metadata?: any
) {
  return prisma.activityLog.create({
    data: {
      userId,
      type,
      entityId: entityId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function getActivityFeed(userId: string, limit = 20) {
  // Get activities from users that the current user follows
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  return prisma.activityLog.findMany({
    where: {
      userId: {
        in: [...followingIds, userId], // Include own activities
      },
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
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  const where: any = { userId };
  if (unreadOnly) {
    where.readAt = null;
  }

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

