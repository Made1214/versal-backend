import { describe, it, expect, vi, beforeEach } from "vitest";

const mockStory = {
  id: "story-123",
  title: "Test Story",
  description: "Test description",
  authorId: "user-123",
  categoryId: "cat-123",
  status: "DRAFT",
  isDeleted: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  author: { username: "testuser", profileImage: "avatar.jpg" },
  category: { name: "Fantasy" },
  tags: [{ tag: { name: "magic" } }],
};

// Mock del repository ANTES de los imports
vi.mock("../../repositories/story.repository.js");
vi.mock("../../repositories/user.repository.js");

import * as storyService from "../../features/stories/story.service.js";
import * as storyRepo from "../../repositories/story.repository.js";
import * as userRepo from "../../repositories/user.repository.js";

describe("Story Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mocks
    storyRepo.findById = vi.fn();
    storyRepo.findMany = vi.fn();
    storyRepo.count = vi.fn();
    storyRepo.create = vi.fn();
    storyRepo.update = vi.fn();
    storyRepo.remove = vi.fn();
    storyRepo.deleteStoryTags = vi.fn();
    storyRepo.findCategoryByName = vi.fn();
    storyRepo.findAllCategories = vi.fn();
    storyRepo.findTagsByNames = vi.fn();
    storyRepo.findTagByName = vi.fn();
    storyRepo.findAllTags = vi.fn();
    
    userRepo.findById = vi.fn();
  });

  describe("getStoryById", () => {
    it("retorna historia formateada", async () => {
      storyRepo.findById.mockResolvedValue(mockStory);
      const result = await storyService.getStoryById("story-123");
      expect(result.id).toBe("story-123");
      expect(result.tags).toEqual([{ name: "magic" }]); // tags formateados
    });

    it("lanza error si no existe", async () => {
      storyRepo.findById.mockResolvedValue(null);
      await expect(storyService.getStoryById("no-existe")).rejects.toThrow("Historia no encontrada");
    });
  });

  describe("createStory", () => {
    it("crea historia correctamente", async () => {
      userRepo.findById.mockResolvedValue({ id: "user-123" });
      storyRepo.findCategoryByName.mockResolvedValue({ id: "cat-123", name: "Fantasy" });
      storyRepo.findTagsByNames.mockResolvedValue([{ id: "tag-1", name: "magic" }]);
      storyRepo.create.mockResolvedValue(mockStory);

      const result = await storyService.createStory({
        title: "Test Story",
        authorId: "user-123",
        category: "Fantasy",
        tags: ["magic"],
      });

      expect(result.id).toBe("story-123");
      expect(storyRepo.create).toHaveBeenCalled();
    });

    it("lanza error si categoría no existe", async () => {
      userRepo.findById.mockResolvedValue({ id: "user-123" });
      storyRepo.findCategoryByName.mockResolvedValue(null);
      await expect(
        storyService.createStory({ title: "Test", authorId: "u1", category: "NoExiste" })
      ).rejects.toThrow("no encontrada");
    });

    it("lanza error si tag no existe", async () => {
      userRepo.findById.mockResolvedValue({ id: "user-123" });
      storyRepo.findCategoryByName.mockResolvedValue({ id: "cat-1", name: "Fantasy" });
      storyRepo.findTagsByNames.mockResolvedValue([]); // ningún tag encontrado
      await expect(
        storyService.createStory({ title: "Test", authorId: "u1", tags: ["NoExiste"] })
      ).rejects.toThrow("no encontrado");
    });
  });

  describe("getAllStories", () => {
    it("retorna historias publicadas con paginación", async () => {
      storyRepo.findMany.mockResolvedValue([mockStory]);
      storyRepo.count.mockResolvedValue(1);

      const result = await storyService.getAllStories({}, { page: 1, limit: 20 });

      expect(result.stories).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(storyRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PUBLISHED", isDeleted: false }),
        expect.any(Object)
      );
    });

    it("filtra por categoría", async () => {
      storyRepo.findCategoryByName.mockResolvedValue({ id: "cat-1" });
      storyRepo.findMany.mockResolvedValue([]);
      storyRepo.count.mockResolvedValue(0);

      await storyService.getAllStories({ categoryName: "Fantasy" });

      expect(storyRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: "cat-1" }),
        expect.any(Object)
      );
    });

    it("retorna vacío si categoría no existe", async () => {
      storyRepo.findCategoryByName.mockResolvedValue(null);
      const result = await storyService.getAllStories({ categoryName: "NoExiste" });
      expect(result.stories).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getStoriesByAuthor", () => {
    it("retorna historias del autor", async () => {
      storyRepo.findMany.mockResolvedValue([mockStory]);
      const result = await storyService.getStoriesByAuthor("user-123");
      expect(result).toHaveLength(1);
      expect(storyRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: "user-123", isDeleted: false })
      );
    });
  });

  describe("updateStory", () => {
    it("actualiza historia correctamente", async () => {
      storyRepo.update.mockResolvedValue({ ...mockStory, title: "Nuevo título" });
      const result = await storyService.updateStory("story-123", { title: "Nuevo título" });
      expect(result.title).toBe("Nuevo título");
    });

    it("actualiza categoría si se proporciona", async () => {
      storyRepo.findCategoryByName.mockResolvedValue({ id: "cat-2", name: "Terror" });
      storyRepo.update.mockResolvedValue(mockStory);
      await storyService.updateStory("story-123", { category: "Terror" });
      expect(storyRepo.update).toHaveBeenCalledWith(
        "story-123",
        expect.objectContaining({ categoryId: "cat-2" })
      );
    });

    it("actualiza tags si se proporcionan", async () => {
      storyRepo.findTagsByNames.mockResolvedValue([{ id: "tag-2", name: "dragons" }]);
      storyRepo.deleteStoryTags.mockResolvedValue({});
      storyRepo.update.mockResolvedValue(mockStory);
      await storyService.updateStory("story-123", { tags: ["dragons"] });
      expect(storyRepo.deleteStoryTags).toHaveBeenCalledWith("story-123");
    });
  });

  describe("deleteStory", () => {
    it("elimina historia correctamente", async () => {
      storyRepo.remove.mockResolvedValue({});
      const result = await storyService.deleteStory("story-123");
      expect(result.message).toContain("eliminados exitosamente");
      expect(storyRepo.remove).toHaveBeenCalledWith("story-123");
    });
  });

  describe("getStoriesByCategory", () => {
    it("retorna historias de la categoría", async () => {
      storyRepo.findCategoryByName.mockResolvedValue({ id: "cat-1" });
      storyRepo.findMany.mockResolvedValue([mockStory]);
      const result = await storyService.getStoriesByCategory("Fantasy");
      expect(result).toHaveLength(1);
    });

    it("retorna vacío si categoría no existe", async () => {
      storyRepo.findCategoryByName.mockResolvedValue(null);
      const result = await storyService.getStoriesByCategory("NoExiste");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAllCategories", () => {
    it("retorna todas las categorías", async () => {
      storyRepo.findAllCategories.mockResolvedValue([{ id: "cat-1", name: "Fantasy" }]);
      const result = await storyService.getAllCategories();
      expect(result).toHaveLength(1);
    });
  });

  describe("getAllTags", () => {
    it("retorna todas las etiquetas", async () => {
      storyRepo.findAllTags.mockResolvedValue([{ id: "tag-1", name: "magic" }]);
      const result = await storyService.getAllTags();
      expect(result).toHaveLength(1);
    });
  });
});
