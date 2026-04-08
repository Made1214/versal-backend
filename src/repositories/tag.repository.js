/**
 * Tag Repository
 * Capa de acceso a datos para el modelo Tag
 * Encapsula todas las operaciones de lectura/escritura de etiquetas
 */

import prisma from "../config/prisma.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/errors.js";

/**
 * Crear una nueva etiqueta
 */
export async function createTag(data) {
  if (!data.name) {
    throw new ValidationError("El nombre de la etiqueta es requerido");
  }

  const existing = await prisma.tag.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new ConflictError("La etiqueta ya existe");
  }

  return await prisma.tag.create({
    data: {
      name: data.name,
    },
  });
}

/**
 * Obtener etiqueta por ID
 */
export async function getTagById(tagId) {
  if (!tagId) {
    throw new ValidationError("Tag ID es requerido");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: {
      stories: {
        where: { story: { isDeleted: false, status: "PUBLISHED" } },
        include: { story: true },
      },
    },
  });

  if (!tag) {
    throw new NotFoundError("Etiqueta no encontrada");
  }

  return tag;
}

/**
 * Obtener etiqueta por nombre
 */
export async function getTagByName(name) {
  if (!name) {
    throw new ValidationError("El nombre de la etiqueta es requerido");
  }

  const tag = await prisma.tag.findUnique({
    where: { name },
    include: {
      stories: {
        where: { story: { isDeleted: false, status: "PUBLISHED" } },
        include: { story: true },
      },
    },
  });

  if (!tag) {
    throw new NotFoundError("Etiqueta no encontrada");
  }

  return tag;
}

/**
 * Obtener todas las etiquetas
 */
export async function getAllTags(pagination = {}) {
  const { page = 1, limit = 50 } = pagination;
  const skip = (page - 1) * limit;

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { stories: true },
        },
      },
    }),
    prisma.tag.count(),
  ]);

  return {
    tags,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar etiqueta
 */
export async function updateTag(tagId, data) {
  if (!tagId) {
    throw new ValidationError("Tag ID es requerido");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new NotFoundError("Etiqueta no encontrada");
  }

  if (data.name && data.name !== tag.name) {
    const existing = await prisma.tag.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError("El nombre de la etiqueta ya existe");
    }
  }

  return await prisma.tag.update({
    where: { id: tagId },
    data: {
      name: data.name,
    },
  });
}

/**
 * Eliminar etiqueta
 */
export async function deleteTag(tagId) {
  if (!tagId) {
    throw new ValidationError("Tag ID es requerido");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new NotFoundError("Etiqueta no encontrada");
  }

  // Verificar si hay historias asociadas
  const storyCount = await prisma.storyTag.count({
    where: { tagId },
  });

  if (storyCount > 0) {
    throw new ValidationError(
      "No se puede eliminar una etiqueta con historias asociadas",
    );
  }

  return await prisma.tag.delete({
    where: { id: tagId },
  });
}

/**
 * Agregar etiqueta a una historia
 */
export async function addTagToStory(storyId, tagId) {
  if (!storyId || !tagId) {
    throw new ValidationError("Story ID y Tag ID son requeridos");
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) {
    throw new NotFoundError("Etiqueta no encontrada");
  }

  return await prisma.storyTag.upsert({
    where: { storyId_tagId: { storyId, tagId } },
    update: {},
    create: { storyId, tagId },
  });
}

/**
 * Remover etiqueta de una historia
 */
export async function removeTagFromStory(storyId, tagId) {
  if (!storyId || !tagId) {
    throw new ValidationError("Story ID y Tag ID son requeridos");
  }

  return await prisma.storyTag.delete({
    where: { storyId_tagId: { storyId, tagId } },
  });
}

/**
 * Obtener etiquetas de una historia
 */
export async function getStoryTags(storyId) {
  if (!storyId) {
    throw new ValidationError("Story ID es requerido");
  }

  return await prisma.storyTag.findMany({
    where: { storyId },
    include: { tag: true },
  });
}

/**
 * Seed de etiquetas por defecto
 */
export async function seedDefaultTags() {
  const defaultTags = [
    "Drama",
    "Dragones",
    "Magia",
    "Aventura",
    "Comedia",
    "Romance",
    "Acción",
    "Misterio",
    "Vampiros",
    "Superhéroes",
  ];

  for (const name of defaultTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}
