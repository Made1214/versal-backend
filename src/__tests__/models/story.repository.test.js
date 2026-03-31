import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import prisma from "../../config/prisma.js";
import * as storyRepository from "../../repositories/story.repository.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

// Mock de Prisma
vi.mock("../../config/prisma.js");

describe("Story Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createStory", () => {
    it("debe crear una historia con datos válidos", async () => {
      const storyData = {
        title: "Mi Historia",
        description: "Una descripción",
        authorId: "user-123",
        categoryId: "cat-1",
      };

      const mockStory = {
        id: "story-1",
        ...storyData,
        status: "DRAFT",
        isAdultContent: false,
        author: { id: "user-123", username: "author", profileImage: null },
        category: { id: "cat-1", name: "Aventura" },
        tags: [],
      };

      prisma.story.create.mockResolvedValue(mockStory);

      const result = await storyRepository.createStory(storyData);

      expect(result).toEqual(mockStory);
      expect(prisma.story.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: storyData.title,
          authorId: storyData.authorId,
        }),
        include: expect.any(Object),
      });
    });

    it("debe lanzar ValidationError si falta title", async () => {
      const storyData = {
        description: "Una descripción",
        authorId: "user-123",
      };

      await expect(storyRepository.createStory(storyData)).rejects.toThrow(ValidationError);
    });

    it("debe lanzar ValidationError si falta authorId", async () => {
      const storyData = {
        title: "Mi Historia",
        description: "Una descripción",
      };

      await expect(storyRepository.createStory(storyData)).rejects.toThrow(ValidationError);
    });
  });

  describe("getStoryById", () => {
    it("debe obtener una historia por ID", async () => {
      const mockStory = {
        id: "story-1",
        title: "Mi Historia",
        author: { id: "user-123", username: "author", profileImage: null },
        category: { id: "cat-1", name: "Aventura" },
        tags: [],
        chapters: [],
      };

      prisma.story.findUnique.mockResolvedValue(mockStory);

      const result = await storyRepository.getStoryById("story-1");

      expect(result).toEqual(mockStory);
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: "story-1" },
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la historia no existe", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(storyRepository.getStoryById("story-999")).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ValidationError si falta storyId", async () => {
      await expect(storyRepository.getStoryById(null)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllStories", () => {
    it("debe obtener todas las historias con paginación", async () => {
      const mockStories = [
        {
          id: "story-1",
          title: "Historia 1",
          author: { id: "user-1", username: "author1", profileImage: null },
          category: null,
          tags: [],
        },
        {
          id: "story-2",
          title: "Historia 2",
          author: { id: "user-2", username: "author2", profileImage: null },
          category: null,
          tags: [],
        },
      ];

      prisma.story.findMany.mockResolvedValue(mockStories);
      prisma.story.count.mockResolvedValue(2);

      const result = await storyRepository.getAllStories({}, { page: 1, limit: 20 });

      expect(result.stories).toEqual(mockStories);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it("debe filtrar por búsqueda", async () => {
      prisma.story.findMany.mockResolvedValue([]);
      prisma.story.count.mockResolvedValue(0);

      await storyRepository.getAllStories({ search: "aventura" }, { page: 1, limit: 20 });

      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it("debe filtrar por categoría", async () => {
      prisma.story.findMany.mockResolvedValue([]);
      prisma.story.count.mockResolvedValue(0);

      await storyRepository.getAllStories({ categoryId: "cat-1" }, { page: 1, limit: 20 });

      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: "cat-1",
          }),
        })
      );
    });
  });

  describe("updateStory", () => {
    it("debe actualizar una historia", async () => {
      const updateData = {
        title: "Título actualizado",
        description: "Descripción actualizada",
      };

      const mockStory = {
        id: "story-1",
        title: "Título actualizado",
        description: "Descripción actualizada",
        author: { id: "user-123", username: "author", profileImage: null },
        category: null,
        tags: [],
      };

      prisma.story.findUnique.mockResolvedValue({ id: "story-1" });
      prisma.story.update.mockResolvedValue(mockStory);

      const result = await storyRepository.updateStory("story-1", updateData);

      expect(result).toEqual(mockStory);
      expect(prisma.story.update).toHaveBeenCalledWith({
        where: { id: "story-1" },
        data: expect.objectContaining(updateData),
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la historia no existe", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(storyRepository.updateStory("story-999", {})).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteStory", () => {
    it("debe hacer soft delete de una historia", async () => {
      const mockStory = {
        id: "story-1",
        isDeleted: true,
        deletedAt: expect.any(Date),
      };

      prisma.story.findUnique.mockResolvedValue({ id: "story-1" });
      prisma.story.update.mockResolvedValue(mockStory);

      const result = await storyRepository.deleteStory("story-1");

      expect(result.isDeleted).toBe(true);
      expect(prisma.story.update).toHaveBeenCalledWith({
        where: { id: "story-1" },
        data: expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      });
    });

    it("debe lanzar NotFoundError si la historia no existe", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(storyRepository.deleteStory("story-999")).rejects.toThrow(NotFoundError);
    });
  });

  describe("incrementViewCount", () => {
    it("debe incrementar el contador de vistas", async () => {
      prisma.story.update.mockResolvedValue({
        id: "story-1",
        viewCount: 11,
      });

      const result = await storyRepository.incrementViewCount("story-1");

      expect(prisma.story.update).toHaveBeenCalledWith({
        where: { id: "story-1" },
        data: { viewCount: { increment: 1 } },
      });
      expect(result.viewCount).toBe(11);
    });
  });

  describe("updateAverageRating", () => {
    it("debe actualizar el rating promedio", async () => {
      const mockRatings = [
        { score: 5 },
        { score: 4 },
        { score: 5 },
      ];

      prisma.rating.findMany.mockResolvedValue(mockRatings);
      prisma.story.update.mockResolvedValue({
        id: "story-1",
        avgRating: 4.7,
        ratingCount: 3,
      });

      const result = await storyRepository.updateAverageRating("story-1");

      expect(result.avgRating).toBe(4.7);
      expect(result.ratingCount).toBe(3);
    });

    it("debe manejar historias sin ratings", async () => {
      prisma.rating.findMany.mockResolvedValue([]);
      prisma.story.update.mockResolvedValue({
        id: "story-1",
        avgRating: 0,
        ratingCount: 0,
      });

      const result = await storyRepository.updateAverageRating("story-1");

      expect(result.avgRating).toBe(0);
      expect(result.ratingCount).toBe(0);
    });
  });
});
