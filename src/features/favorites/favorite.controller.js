const favoriteService = require("./favorite.service");

async function toggleFavorite(request, reply) {
  const { storyId } = request.params;
  const { userId } = request.user;
  const result = await favoriteService.toggleFavorite(userId, storyId);
  reply.send(result);
}

async function getFavoriteStories(request, reply) {
  const { userId } = request.user;
  const result = await favoriteService.getFavoriteStoriesByUser(userId);
  reply.send(result);
}

async function getIsFavorite(request, reply) {
  const { storyId } = request.params;
  const { userId } = request.user;

  const result = await favoriteService.checkIsFavorite(userId, storyId);
  reply.code(200).send(result);
}

module.exports = {
  toggleFavorite,
  getIsFavorite,
  getFavoriteStories,
};
