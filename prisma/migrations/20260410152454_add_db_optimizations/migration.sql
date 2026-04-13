/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,2)`.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS citext;

-- DropIndex
DROP INDEX "ChapterLike_chapterId_idx";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,2);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DATA TYPE CITEXT,
ALTER COLUMN "email" SET DATA TYPE CITEXT;

-- CreateIndex
CREATE INDEX "Chapter_storyId_status_chapterNumber_idx" ON "Chapter"("storyId", "status", "chapterNumber");

-- CreateIndex
CREATE INDEX "ChapterLike_chapterId_createdAt_idx" ON "ChapterLike"("chapterId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_chapterId_isDeleted_createdAt_idx" ON "Comment"("chapterId", "isDeleted", "createdAt");

-- CreateIndex
CREATE INDEX "Story_status_updatedAt_idx" ON "Story"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
