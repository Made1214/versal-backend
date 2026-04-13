-- AlterTable
ALTER TABLE "ChapterMedia" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "coverImagePublicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImagePublicId" TEXT;
