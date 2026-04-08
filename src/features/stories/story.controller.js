import * as storyService from "./story.service.js";
import { deleteImage, uploadCover } from "../../utils/cloudinary.js";
import { isAdminRole } from "../../utils/roles.js";

// Controlador para crear una nueva historia
async function createStory(request, reply) {
  const { userId } = request.user;
  const data = { authorId: userId };

  const parts = request.parts();
  for await (const part of parts) {
    if (part.file) {
      const uploadResult = await uploadCover(part);
      data.coverImage = uploadResult.url;
      data.coverImagePublicId = uploadResult.publicId;
    } else {
      if (part.fieldname === "characters" || part.fieldname === "tags") {
        data[part.fieldname] = JSON.parse(part.value);
      } else {
        data[part.fieldname] = part.value;
      }
    }
  }

  if (!data.coverImage) {
    return reply
      .code(400)
      .send({ error: "La imagen de portada es requerida." });
  }

  const story = await storyService.createStory(data);
  reply.code(201).send({ story });
}

// Controlador para obtener una historia por ID
async function getStoryById(request, reply) {
  const { id } = request.params;
  const story = await storyService.getStoryById(id);
  reply.send({ story });
}

// Controlador para obtener todas las historias publicadas
async function getAllStories(request, reply) {
  const filters = request.query;
  const stories = await storyService.getAllStories(filters);
  reply.send({ stories });
}

// Controlador para obtener las historias de un autor específico
async function getStoriesByAuthor(request, reply) {
  const { userId } = request.user;
  const stories = await storyService.getStoriesByAuthor(userId);
  reply.send({ stories });
}

// obtener las historias de autor por ID para perfil publico
async function getStoriesByAuthorPublic(request, reply) {
  const { authorId } = request.params;
  const stories = await storyService.getPublicStoriesByAuthor(authorId);
  reply.send({ stories });
}

// Controlador para actualizar una historia
async function updateStory(request, reply) {
  const { id } = request.params;
  const { userId } = request.user;

  const existingStory = await storyService.getStoryById(id);
  if (existingStory.authorId !== userId) {
    return reply
      .code(403)
      .send({ error: "No tienes permiso para editar esta historia." });
  }

  const data = {};
  const contentType = request.headers["content-type"] || "";
  const isMultipart = contentType.includes("multipart/form-data");

  if (isMultipart) {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.file) {
        const uploadResult = await uploadCover(part);
        data.coverImage = uploadResult.url;
        data.coverImagePublicId = uploadResult.publicId;
      } else if (!part.file) {
        if (part.fieldname === "characters" || part.fieldname === "tags") {
          data[part.fieldname] = JSON.parse(part.value);
        } else {
          data[part.fieldname] = part.value;
        }
      }
    }
  } else {
    Object.assign(data, request.body);
  }

  const story = await storyService.updateStory(id, data);

  // Si reemplazamos portada, limpiamos el archivo previo luego de persistir los cambios.
  if (
    data.coverImagePublicId &&
    existingStory.coverImagePublicId &&
    existingStory.coverImagePublicId !== data.coverImagePublicId
  ) {
    await deleteImage(existingStory.coverImagePublicId, "image");
  }

  reply.send({ story });
}

//Eliminar una historia
async function deleteStory(request, reply) {
  const { id } = request.params;
  const { userId, role } = request.user;

  const existingStory = await storyService.getStoryById(id);

  const isAuthor = existingStory.authorId === userId;

  if (!isAuthor && !isAdminRole(role)) {
    return reply
      .code(403)
      .send({ error: "No tienes permiso para eliminar esta historia." });
  }

  if (existingStory.coverImagePublicId) {
    await deleteImage(existingStory.coverImagePublicId, "image");
  }

  const result = await storyService.deleteStory(id);
  reply.send({ message: "Historia eliminada exitosamente." });
}

// Controlador para obtener historias por categoría
async function getStoriesByCategory(request, reply) {
  const { categoryName } = request.params;
  const stories = await storyService.getStoriesByCategory(categoryName);
  reply.send({ stories });
}

// Controlador para obtener historias por etiqueta
async function getStoriesByTag(request, reply) {
  const { tagName } = request.params;
  const stories = await storyService.getStoriesByTag(tagName);
  reply.send({ stories });
}

// controlador para obtener todas las categorías
async function getAllCategories(request, reply) {
  const categories = await storyService.getAllCategories();
  reply.send({ categories });
}

// controlador para obtener todos los tags
async function getAllTags(request, reply) {
  const tags = await storyService.getAllTags();
  reply.send({ tags });
}

export {
  createStory,
  getStoryById,
  getAllStories,
  getStoriesByAuthor,
  updateStory,
  deleteStory,
  getStoriesByCategory,
  getStoriesByTag,
  getAllCategories,
  getAllTags,
  getStoriesByAuthorPublic,
};
