import prisma from "../../config/prisma.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

async function toggleFavorite(userId, storyId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });
    return { status: "unfavorited" };
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        storyId,
      },
    });
    return { status: "favorited" };
  }
}

async function checkIsFavorite(userId, storyId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });

  const isFavorite = !!favorite;
  return { isFavorite };
}

async function getFavoriteStoriesByUser(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      story: {
        include: {
          author: {
            select: { username: true, profileImage: true },
          },
        },
      },
    },
  });

  const stories = favorites.map((fav) => fav.story);
  return { stories };
}

export {
  toggleFavorite,
  getFavoriteStoriesByUser,
  checkIsFavorite,
};
