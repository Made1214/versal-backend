import * as storyRepo from "../../repositories/story.repository.js";
import * as userRepo from "../../repositories/user.repository.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

async function createStory(storyData) {
  const { authorId, category: categoryName, tags: tagNames, ...rest } = storyData;

  const author = await userRepo.findById(authorId);
  if (!author) {
    throw new NotFoundError("Autor no encontrado");
  }

  const categoryId = await resolveCategoryId(categoryName);
  const tagIds = await resolveTagIds(tagNames);

  const newStory = await storyRepo.create({
    ...rest,
    authorId,
    categoryId,
    tags: {
      create: tagIds.map((tagId) => ({ tagId })),
    },
  });

  return formatStory(newStory);
}

async function getStoryById(storyId) {
  const story = await storyRepo.findById(storyId);
  if (!story) {
    throw new NotFoundError("Historia no encontrada");
  }
  return formatStory(story);
}

async function getAllStories(filters = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const queryConditions = { status: "PUBLISHED", isDeleted: false };

  if (filters.categoryName) {
    const category = await storyRepo.findCategoryByName(filters.categoryName);
    if (!category) return { stories: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    queryConditions.categoryId = category.id;
  }

  if (filters.tagName) {
    const tag = await storyRepo.findTagByName(filters.tagName);
    if (!tag) return { stories: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    queryConditions.tags = { some: { tagId: tag.id } };
  }

  if (filters.search) {
    queryConditions.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [stories, total] = await Promise.all([
    storyRepo.findMany(queryConditions, { skip, take: limit }),
    storyRepo.count(queryConditions)
  ]);

  return {
    stories: stories.map(formatStory),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getStoriesByAuthor(authorId) {
  const stories = await storyRepo.findMany({ authorId, isDeleted: false });
  return stories.map(formatStory);
}

async function getPublicStoriesByAuthor(authorId) {
  const stories = await storyRepo.findMany({ authorId, status: "PUBLISHED", isDeleted: false });
  return stories.map(formatStory);
}

async function updateStory(storyId, updateData) {
  const { category: categoryName, tags: tagNames, ...rest } = updateData;
  const updatePayload = { ...rest };

  if (categoryName) {
    updatePayload.categoryId = await resolveCategoryId(categoryName);
  }

  if (tagNames) {
    const tagIds = await resolveTagIds(tagNames);
    await storyRepo.deleteStoryTags(storyId);
    updatePayload.tags = {
      create: tagIds.map((tagId) => ({ tagId })),
    };
  }

  const updatedStory = await storyRepo.update(storyId, updatePayload);
  if (!updatedStory) {
    throw new NotFoundError("Historia no encontrada");
  }

  return formatStory(updatedStory);
}

async function deleteStory(storyId) {
  await storyRepo.remove(storyId);
  return { message: "Historia y todos sus datos asociados fueron eliminados exitosamente." };
}

async function getStoriesByCategory(categoryName) {
  const category = await storyRepo.findCategoryByName(categoryName);
  if (!category) {
    return [];
  }

  const stories = await storyRepo.findMany({
    categoryId: category.id,
    status: "PUBLISHED",
    isDeleted: false,
  });

  return stories.map(formatStory);
}

async function getStoriesByTag(tagName) {
  const tag = await storyRepo.findTagByName(tagName);
  if (!tag) {
    return [];
  }

  const stories = await storyRepo.findMany({
    tags: { some: { tagId: tag.id } },
    status: "PUBLISHED",
    isDeleted: false,
  });

  return stories.map(formatStory);
}

async function getAllCategories() {
  return await storyRepo.findAllCategories();
}

async function getAllTags() {
  return await storyRepo.findAllTags();
}

// Helper functions
async function resolveCategoryId(categoryName) {
  if (!categoryName) return null;
  const category = await storyRepo.findCategoryByName(categoryName);
  if (!category) throw new ValidationError(`Categoria '${categoryName}' no encontrada`);
  return category.id;
}

async function resolveTagIds(tagNames) {
  if (!tagNames || tagNames.length === 0) return [];
  const found = await storyRepo.findTagsByNames(tagNames);
  if (found.length !== tagNames.length) {
    const missing = tagNames.find((t) => !found.map((f) => f.name).includes(t));
    throw new ValidationError(`Tag '${missing}' no encontrado`);
  }
  return found.map((t) => t.id);
}

function formatStory(story) {
  if (!story) return null;
  return {
    ...story,
    tags: story.tags?.map((st) => st.tag) || [],
  };
}

export {
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
