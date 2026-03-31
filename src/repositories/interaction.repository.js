/**
 * Interaction Repository - Acceso a datos para ChapterLike y Comment
 */

import prisma from "../config/prisma.js";

// --- Likes ---

export async function findLike(userId, chapterId) {
  return await prisma.chapterLike.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });
}

export async function createLike(userId, chapterId) {
  return await prisma.chapterLike.create({ data: { userId, chapterId } });
}

export async function deleteLike(userId, chapterId) {
  return await prisma.chapterLike.delete({
    where: { userId_chapterId: { userId, chapterId } },
  });
}

export async function findLikesByChapter(chapterId) {
  return await prisma.chapterLike.findMany({
    where: { chapterId },
    include: { user: { select: { username: true, profileImage: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function countLikesByStory(storyId) {
  return await prisma.chapterLike.count({ where: { chapter: { storyId } } });
}

// --- Comments ---

export async function findCommentById(id) {
  return await prisma.comment.findUnique({
    where: { id },
    include: { chapter: { select: { storyId: true } } },
  });
}

export async function createComment(userId, chapterId, content) {
  return await prisma.comment.create({
    data: { content, userId, chapterId },
    include: { user: { select: { username: true, profileImage: true } } },
  });
}

export async function softDeleteComment(id) {
  return await prisma.comment.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

export async function findCommentsByChapter(chapterId) {
  return await prisma.comment.findMany({
    where: { chapterId, isDeleted: false },
    include: {
      user: { select: { username: true, profileImage: true } },
      replies: {
        where: { isDeleted: false },
        include: { user: { select: { username: true, profileImage: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// --- Story likes counter ---

export async function updateStoryViewCount(storyId, count) {
  return await prisma.story.update({
    where: { id: storyId },
    data: { viewCount: count },
  });
}
