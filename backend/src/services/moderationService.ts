import { prisma } from "../lib/prisma";

export async function createReport(
  type: "Article" | "Comment",
  itemId: string,
  reporterId: string,
  reason: string
) {
  // Check if user already reported this item
  const existing = await prisma.report.findFirst({
    where: {
      type,
      itemId,
      reporterId,
      status: { in: ["Open", "InReview"] },
    },
  });

  if (existing) {
    throw new Error("You have already reported this item");
  }

  const report = await prisma.report.create({
    data: {
      type,
      itemId,
      reporterId,
      reason,
      status: "Open",
    },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  // Notify admins (simplified - in production, use a proper notification system)
  // For now, we'll just create the report and admins can check the moderation dashboard

  return report;
}

export async function getReports(
  status?: "Open" | "InReview" | "Resolved",
  type?: "Article" | "Comment",
  page = 1,
  limit = 20
) {
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateReportStatus(
  reportId: string,
  status: "Open" | "InReview" | "Resolved",
  resolutionNotes: string | null,
  adminId: string
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  const updateData: any = {
    status,
    resolutionNotes: resolutionNotes || null,
  };

  if (status === "Resolved") {
    updateData.resolvedAt = new Date();
  }

  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: updateData,
  });

  // Log moderation action
  await prisma.moderationAction.create({
    data: {
      adminId,
      targetType: "Report",
      targetId: reportId,
      action: `update_status_${status.toLowerCase()}`,
      notes: resolutionNotes || null,
    },
  });

  // If resolving and action is to delete/hide, handle it
  if (status === "Resolved" && resolutionNotes?.toLowerCase().includes("delete")) {
    if (report.type === "Comment") {
      await prisma.comment.update({
        where: { id: report.itemId },
        data: { deletedAt: new Date() },
      });

      await prisma.moderationAction.create({
        data: {
          adminId,
          targetType: "Comment",
          targetId: report.itemId,
          action: "delete",
          notes: `Deleted via report resolution: ${reportId}`,
        },
      });
    } else if (report.type === "Article") {
      // Articles are typically not deleted, but could be hidden or flagged
      // For now, we'll just log the action
      await prisma.moderationAction.create({
        data: {
          adminId,
          targetType: "Article",
          targetId: report.itemId,
          action: "flagged",
          notes: `Flagged via report resolution: ${reportId}`,
        },
      });
    }
  }

  return updatedReport;
}

export async function getModerationAudit(limit = 50) {
  return prisma.moderationAction.findMany({
    take: limit,
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReportContext(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  let context: any = null;

  if (report.type === "Article") {
    const article = await prisma.article.findUnique({
      where: { id: report.itemId },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
    context = article;
  } else if (report.type === "Comment") {
    const comment = await prisma.comment.findUnique({
      where: { id: report.itemId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    context = comment;
  }

  return {
    report,
    context,
  };
}

