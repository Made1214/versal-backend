/**
 * Story Repository - Acceso a datos para Story, Category y Tag
 */

import prisma from "../config/prisma.js";

// Include estándar para historias
const storyInclude = {
  author: { select: { username: true, profileImage: true } },
  category: { select: { name: true } },
  tags: { include: { tag: { select: { name: true } } } },
};

// --- Stories ---

export async function findById(id, dbClient = prisma) {
  return await dbClient.story.findUnique({
    where: { id },
    include: storyInclude,
  });
}

export async function findMany(where, { skip = 0, take = 20 } = {}) {
  return await prisma.story.findMany({
    where,
    skip,
    take,
    orderBy: { updatedAt: "desc" },
    include: storyInclude,
  });
}

export async function count(where) {
  return await prisma.story.count({ where });
}

export async function create(data) {
  return await prisma.story.create({ data, include: storyInclude });
}

export async function update(id, data) {
  return await prisma.story.update({
    where: { id },
    data,
    include: storyInclude,
  });
}

export async function remove(id) {
  return await prisma.story.delete({ where: { id } });
}

// --- StoryTags ---

export async function deleteStoryTags(storyId) {
  return await prisma.storyTag.deleteMany({ where: { storyId } });
}

// --- Categories ---

export async function findCategoryByName(name) {
  return await prisma.category.findUnique({ where: { name } });
}

export async function findAllCategories() {
  return await prisma.category.findMany();
}

// --- Tags ---

export async function findTagsByNames(names) {
  return await prisma.tag.findMany({ where: { name: { in: names } } });
}

export async function findTagByName(name) {
  return await prisma.tag.findUnique({ where: { name } });
}

export async function findAllTags() {
  return await prisma.tag.findMany();
}
