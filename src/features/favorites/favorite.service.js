import * as storyRepo from "../../repositories/story.repository.js";
import * as favoriteRepo from "../../repositories/favorite.repository.js";
import { NotFoundError } from "../../utils/errors.js";

async function toggleFavorite(userId, storyId) {
  const story = await storyRepo.findById(storyId);
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }

  const existingFavorite = await favoriteRepo.findByUserAndStory(userId, storyId);

  if (existingFavorite) {
    await favoriteRepo.remove(userId, storyId);
    return { status: "unfavorited" };
  } else {
    await favoriteRepo.create(userId, storyId);
    return { status: "favorited" };
  }
}

async function checkIsFavorite(userId, storyId) {
  const story = await storyRepo.findById(storyId);
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }

  const favorite = await favoriteRepo.findByUserAndStory(userId, storyId);
  const isFavorite = !!favorite;
  return { isFavorite };
}

async function getFavoriteStoriesByUser(userId) {
  const favorites = await favoriteRepo.findManyByUser(userId);
  const stories = favorites.map((fav) => fav.story);
  return { stories };
}

export {
  toggleFavorite,
  getFavoriteStoriesByUser,
  checkIsFavorite,
};
