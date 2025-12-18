-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Article_title_idx" ON "Article"("title");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
