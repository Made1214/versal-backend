import { authHeaders, storyProperties } from "../../schemas/shared.schema.js";

const favoriteStoryIdParamSchema = {
  type: "object",
  required: ["storyId"],
  properties: {
    storyId: { type: "string" },
  },
};

const toggleFavoriteSchema = {
  summary: "Agregar o quitar favorito",
  description:
    "Alterna el estado de favorito de una historia para el usuario autenticado.",
  tags: ["Favorites"],
  headers: authHeaders,
  params: favoriteStoryIdParamSchema,
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["favorited", "unfavorited"] },
      },
    },
  },
};

const getIsFavoriteSchema = {
  summary: "Consultar favorito",
  description:
    "Devuelve si una historia esta marcada como favorita por el usuario autenticado.",
  tags: ["Favorites"],
  headers: authHeaders,
  params: favoriteStoryIdParamSchema,
  response: {
    200: {
      type: "object",
      properties: {
        isFavorite: { type: "boolean" },
      },
    },
  },
};

const getFavoriteStoriesSchema = {
  summary: "Listar favoritos",
  description: "Obtiene las historias favoritas del usuario autenticado.",
  tags: ["Favorites"],
  headers: authHeaders,
  response: {
    200: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: storyProperties,
          },
        },
      },
    },
  },
};

export { toggleFavoriteSchema, getIsFavoriteSchema, getFavoriteStoriesSchema };
