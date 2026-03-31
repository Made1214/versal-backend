/**
 * Favorite Repository - Acceso a datos para Favorite
 */

import prisma from "../config/prisma.js";

const favoriteInclude = {
  story: {
    include: {
      author: {
        select: { username: true, profileImage: true },
      },
    },
  },
};

export async function findByUserAndStory(userId, storyId) {
  return await prisma.favorite.findUnique({
    where: {
      userId_storyId: { userId, storyId },
    },
  });
}

export async function create(userId, storyId) {
  return await prisma.favorite.create({
    data: { userId, storyId },
  });
}

export async function remove(userId, storyId) {
  return await prisma.favorite.delete({
    where: {
      userId_storyId: { userId, storyId },
    },
  });
}

export async function findManyByUser(userId) {
  return await prisma.favorite.findMany({
    where: { userId },
    include: favoriteInclude,
  });
}
