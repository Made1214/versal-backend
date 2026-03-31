/**
 * Category Repository
 * Capa de acceso a datos para el modelo Category
 * Encapsula todas las operaciones de lectura/escritura de categorías
 */

import prisma from "../config/prisma.js";
import { NotFoundError, ValidationError, ConflictError } from "../utils/errors.js";

/**
 * Crear una nueva categoría
 */
export async function createCategory(data) {
  if (!data.name) {
    throw new ValidationError("El nombre de la categoría es requerido");
  }

  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new ConflictError("La categoría ya existe");
  }

  return await prisma.category.create({
    data: {
      name: data.name,
    },
  });
}

/**
 * Obtener categoría por ID
 */
export async function getCategoryById(categoryId) {
  if (!categoryId) {
    throw new ValidationError("Category ID es requerido");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      stories: {
        where: { isDeleted: false, status: "PUBLISHED" },
        select: { id: true, title: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }

  return category;
}

/**
 * Obtener categoría por nombre
 */
export async function getCategoryByName(name) {
  if (!name) {
    throw new ValidationError("El nombre de la categoría es requerido");
  }

  const category = await prisma.category.findUnique({
    where: { name },
    include: {
      stories: {
        where: { isDeleted: false, status: "PUBLISHED" },
        select: { id: true, title: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }

  return category;
}

/**
 * Obtener todas las categorías
 */
export async function getAllCategories(pagination = {}) {
  const { page = 1, limit = 50 } = pagination;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { stories: { where: { isDeleted: false, status: "PUBLISHED" } } },
        },
      },
    }),
    prisma.category.count(),
  ]);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar categoría
 */
export async function updateCategory(categoryId, data) {
  if (!categoryId) {
    throw new ValidationError("Category ID es requerido");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError("El nombre de la categoría ya existe");
    }
  }

  return await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
    },
  });
}

/**
 * Eliminar categoría
 */
export async function deleteCategory(categoryId) {
  if (!categoryId) {
    throw new ValidationError("Category ID es requerido");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }

  // Verificar si hay historias asociadas
  const storyCount = await prisma.story.count({
    where: { categoryId },
  });

  if (storyCount > 0) {
    throw new ValidationError("No se puede eliminar una categoría con historias asociadas");
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
}

/**
 * Seed de categorías por defecto
 */
export async function seedDefaultCategories() {
  const defaultCategories = [
    "Acción",
    "Aventura",
    "Romance",
    "Fantasía",
    "Terror",
    "Misterio",
    "Ciencia Ficción",
    "Drama",
    "Juvenil",
  ];

  try {
    for (const name of defaultCategories) {
      await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  } catch (error) {
    console.error("Error al sembrar categorías por defecto:", error);
  }
}
