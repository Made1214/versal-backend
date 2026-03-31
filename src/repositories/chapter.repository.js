/**
 * Chapter Repository - Acceso a datos para Chapter
 */

import prisma from "../config/prisma.js";

export async function findById(id) {
  return await prisma.chapter.findUnique({
    where: { id },
    include: { story: { select: { title: true, authorId: true } } },
  });
}

export async function findByStory(storyId) {
  return await prisma.chapter.findMany({
    where: { storyId },
    orderBy: { chapterNumber: "asc" },
  });
}

export async function create(data) {
  return await prisma.chapter.create({ data });
}

export async function update(id, data) {
  return await prisma.chapter.update({ where: { id }, data });
}

export async function remove(id) {
  return await prisma.chapter.delete({ where: { id } });
}

export async function countPublished(storyId) {
  return await prisma.chapter.count({ where: { storyId, status: "published" } });
}
