import { prisma } from "../lib/prisma";

/**
 * Publishes articles that are scheduled and have reached their scheduledFor date
 */
export async function publishDueArticles(): Promise<number> {
  const now = new Date();

  const scheduledArticles = await prisma.article.findMany({
    where: {
      status: "Scheduled",
      scheduledFor: {
        lte: now,
      },
    },
  });

  let publishedCount = 0;

  for (const article of scheduledArticles) {
    await prisma.article.update({
      where: { id: article.id },
      data: {
        status: "Published",
        publishedAt: article.scheduledFor || now,
        scheduledFor: null,
      },
    });
    publishedCount++;
  }

  return publishedCount;
}

