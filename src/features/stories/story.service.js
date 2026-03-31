const prisma = require("../../config/prisma");
const { NotFoundError, ValidationError } = require("../../utils/errors");

async function createStory(storyData) {
  const { authorId, category: categoryName, tags: tagNames, ...rest } = storyData;

  const author = await prisma.user.findUnique({ where: { id: authorId } });
  if (!author) {
    throw new NotFoundError("Autor no encontrado");
  }

  let categoryId = null;
  if (categoryName) {
    const category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      throw new ValidationError(`Categoria '${categoryName}' no encontrada`);
    }
    categoryId = category.id;
  }

  let tagIds = [];
  if (tagNames && tagNames.length > 0) {
    const foundTags = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
    if (foundTags.length !== tagNames.length) {
      const foundTagNames = foundTags.map((t) => t.name);
      const missingTag = tagNames.find((t) => !foundTagNames.includes(t));
      throw new ValidationError(`Tag '${missingTag}' no encontrado`);
    }
    tagIds = foundTags.map((t) => t.id);
  }

  const newStory = await prisma.story.create({
    data: {
      ...rest,
      authorId,
      categoryId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return formatStory(newStory);
}

async function getStoryById(storyId) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }
  return formatStory(story);
}

async function getAllStories(filters = {}) {
  const queryConditions = { status: "PUBLISHED", isDeleted: false };

  if (filters.categoryName) {
    const category = await prisma.category.findUnique({ where: { name: filters.categoryName } });
    if (!category) return [];
    queryConditions.categoryId = category.id;
  }

  if (filters.tagName) {
    const tag = await prisma.tag.findUnique({ where: { name: filters.tagName } });
    if (!tag) return [];
    queryConditions.tags = { some: { tagId: tag.id } };
  }

  if (filters.search) {
    queryConditions.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const stories = await prisma.story.findMany({
    where: queryConditions,
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return stories.map(formatStory);
}

async function getStoriesByAuthor(authorId) {
  const stories = await prisma.story.findMany({
    where: { authorId, isDeleted: false },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return stories.map(formatStory);
}

async function getPublicStoriesByAuthor(authorId) {
  const stories = await prisma.story.findMany({
    where: { authorId, status: "PUBLISHED", isDeleted: false },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return stories.map(formatStory);
}

async function updateStory(storyId, updateData) {
  const { category: categoryName, tags: tagNames, ...rest } = updateData;
  const updatePayload = { ...rest };

  if (categoryName) {
    const category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) throw new ValidationError(`Categoria '${categoryName}' no encontrada.`);
    updatePayload.categoryId = category.id;
  }

  if (tagNames) {
    const foundTags = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
    if (foundTags.length !== tagNames.length) {
      const missingTag = tagNames.find((t) => !foundTags.map((tag) => tag.name).includes(t));
      throw new ValidationError(`Tag '${missingTag}' no encontrado`);
    }

    // Eliminar tags antiguos y crear nuevos
    await prisma.storyTag.deleteMany({ where: { storyId } });
    updatePayload.tags = {
      create: foundTags.map((tag) => ({ tagId: tag.id })),
    };
  }

  const updatedStory = await prisma.story.update({
    where: { id: storyId },
    data: updatePayload,
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  if (!updatedStory) {
    throw new NotFoundError("Historia no encontrada");
  }

  return formatStory(updatedStory);
}

async function deleteStory(storyId) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    select: { id: true },
  });
  const chapterIds = chapters.map((chapter) => chapter.id);

  if (chapterIds.length > 0) {
    await prisma.comment.deleteMany({
      where: { chapterId: { in: chapterIds } },
    });
  }

  if (chapterIds.length > 0) {
    await prisma.chapter.deleteMany({ where: { id: { in: chapterIds } } });
  }

  await prisma.favorite.deleteMany({ where: { storyId } });

  const deletedStory = await prisma.story.delete({
    where: { id: storyId },
  });

  if (!deletedStory) {
    throw new NotFoundError("Historia no encontrada");
  }

  return { message: "Historia y todos sus datos asociados fueron eliminados exitosamente." };
}

async function getStoriesByCategory(categoryName) {
  const category = await prisma.category.findUnique({ where: { name: categoryName } });
  if (!category) {
    return [];
  }

  const stories = await prisma.story.findMany({
    where: { categoryId: category.id, status: "PUBLISHED", isDeleted: false },
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return stories.map(formatStory);
}

async function getStoriesByTag(tagName) {
  const tag = await prisma.tag.findUnique({ where: { name: tagName } });
  if (!tag) {
    return [];
  }

  const stories = await prisma.story.findMany({
    where: {
      tags: { some: { tagId: tag.id } },
      status: "PUBLISHED",
      isDeleted: false,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { username: true, profileImage: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return stories.map(formatStory);
}

async function getAllCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

async function getAllTags() {
  const tags = await prisma.tag.findMany();
  return tags;
}

module.exports = {
  createStory,
  getStoryById,
  getAllStories,
  updateStory,
  deleteStory,
  getStoriesByAuthor,
  getStoriesByCategory,
  getStoriesByTag,
  getAllCategories,
  getAllTags,
  getPublicStoriesByAuthor,
};

// Helper function to format story response
function formatStory(story) {
  if (!story) return null;
  return {
    ...story,
    tags: story.tags?.map((st) => st.tag) || [],
  };
}
