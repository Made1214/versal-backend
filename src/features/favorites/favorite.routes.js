import * as favoriteController from "./favorite.controller.js";
import {
  toggleFavoriteSchema,
  getIsFavoriteSchema,
  getFavoriteStoriesSchema,
} from "./favorite.schema.js";

async function favoriteRoutes(fastify) {
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Ruta para obtener la lista de historias favoritas del usuario
    privateRoutes.get(
      "/me/favorites",
      { schema: getFavoriteStoriesSchema },
      favoriteController.getFavoriteStories,
    );

    // Ruta para añadir/quitar una historia de favoritos
    privateRoutes.post(
      "/stories/:storyId/favorite",
      { schema: toggleFavoriteSchema },
      favoriteController.toggleFavorite,
    );

    // Obtener si una historia es favorita para el usuario actual
    privateRoutes.get(
      "/stories/:storyId/isFavorite",
      { schema: getIsFavoriteSchema },
      favoriteController.getIsFavorite,
    );
  });
}

export default favoriteRoutes;
