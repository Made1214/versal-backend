import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../config/prisma.js";
import * as tagRepository from "../../repositories/tag.repository.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";

// Mock de Prisma
vi.mock("../../config/prisma.js");

describe("Tag Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTag", () => {
    it("debe crear una etiqueta con datos válidos", async () => {
      const tagData = { name: "Magia" };
      const mockTag = { id: "tag-1", name: "Magia" };

      prisma.tag.findUnique.mockResolvedValue(null);
      prisma.tag.create.mockResolvedValue(mockTag);

      const result = await tagRepository.createTag(tagData);

      expect(result).toEqual(mockTag);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: "Magia" },
      });
    });

    it("debe lanzar ValidationError si falta name", async () => {
      await expect(tagRepository.createTag({})).rejects.toThrow(ValidationError);
    });

    it("debe lanzar ConflictError si la etiqueta ya existe", async () => {
      const tagData = { name: "Magia" };

      prisma.tag.findUnique.mockResolvedValue({ id: "tag-1", name: "Magia" });

      await expect(tagRepository.createTag(tagData)).rejects.toThrow(ConflictError);
    });
  });

  describe("getTagById", () => {
    it("debe obtener una etiqueta por ID", async () => {
      const mockTag = {
        id: "tag-1",
        name: "Magia",
        stories: [],
      };

      prisma.tag.findUnique.mockResolvedValue(mockTag);

      const result = await tagRepository.getTagById("tag-1");

      expect(result).toEqual(mockTag);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la etiqueta no existe", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagRepository.getTagById("tag-999")).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ValidationError si falta tagId", async () => {
      await expect(tagRepository.getTagById(null)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTagByName", () => {
    it("debe obtener una etiqueta por nombre", async () => {
      const mockTag = {
        id: "tag-1",
        name: "Magia",
        stories: [],
      };

      prisma.tag.findUnique.mockResolvedValue(mockTag);

      const result = await tagRepository.getTagByName("Magia");

      expect(result).toEqual(mockTag);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: "Magia" },
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la etiqueta no existe", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagRepository.getTagByName("NoExiste")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAllTags", () => {
    it("debe obtener todas las etiquetas con paginación", async () => {
      const mockTags = [
        { id: "tag-1", name: "Magia", _count: { stories: 10 } },
        { id: "tag-2", name: "Dragones", _count: { stories: 8 } },
      ];

      prisma.tag.findMany.mockResolvedValue(mockTags);
      prisma.tag.count.mockResolvedValue(2);

      const result = await tagRepository.getAllTags({ page: 1, limit: 50 });

      expect(result.tags).toEqual(mockTags);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe("updateTag", () => {
    it("debe actualizar una etiqueta", async () => {
      const updateData = { name: "Magia Oscura" };
      const mockTag = { id: "tag-1", name: "Magia Oscura" };

      prisma.tag.findUnique.mockResolvedValueOnce({ id: "tag-1", name: "Magia" });
      prisma.tag.findUnique.mockResolvedValueOnce(null);
      prisma.tag.update.mockResolvedValue(mockTag);

      const result = await tagRepository.updateTag("tag-1", updateData);

      expect(result).toEqual(mockTag);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        data: { name: "Magia Oscura" },
      });
    });

    it("debe lanzar NotFoundError si la etiqueta no existe", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagRepository.updateTag("tag-999", {})).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ConflictError si el nuevo nombre ya existe", async () => {
      prisma.tag.findUnique.mockResolvedValueOnce({ id: "tag-1", name: "Magia" });
      prisma.tag.findUnique.mockResolvedValueOnce({ id: "tag-2", name: "Dragones" });

      await expect(tagRepository.updateTag("tag-1", { name: "Dragones" })).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe("deleteTag", () => {
    it("debe eliminar una etiqueta sin historias", async () => {
      const mockTag = { id: "tag-1", name: "Magia" };

      prisma.tag.findUnique.mockResolvedValue(mockTag);
      prisma.storyTag.count.mockResolvedValue(0);
      prisma.tag.delete.mockResolvedValue(mockTag);

      const result = await tagRepository.deleteTag("tag-1");

      expect(result).toEqual(mockTag);
      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: "tag-1" },
      });
    });

    it("debe lanzar ValidationError si la etiqueta tiene historias", async () => {
      prisma.tag.findUnique.mockResolvedValue({ id: "tag-1", name: "Magia" });
      prisma.storyTag.count.mockResolvedValue(5);

      await expect(tagRepository.deleteTag("tag-1")).rejects.toThrow(ValidationError);
    });

    it("debe lanzar NotFoundError si la etiqueta no existe", async () => {
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagRepository.deleteTag("tag-999")).rejects.toThrow(NotFoundError);
    });
  });

  describe("addTagToStory", () => {
    it("debe agregar una etiqueta a una historia", async () => {
      const mockStoryTag = { storyId: "story-1", tagId: "tag-1" };

      prisma.story.findUnique.mockResolvedValue({ id: "story-1" });
      prisma.tag.findUnique.mockResolvedValue({ id: "tag-1" });
      prisma.storyTag.upsert.mockResolvedValue(mockStoryTag);

      const result = await tagRepository.addTagToStory("story-1", "tag-1");

      expect(result).toEqual(mockStoryTag);
      expect(prisma.storyTag.upsert).toHaveBeenCalledWith({
        where: { storyId_tagId: { storyId: "story-1", tagId: "tag-1" } },
        update: {},
        create: { storyId: "story-1", tagId: "tag-1" },
      });
    });

    it("debe lanzar NotFoundError si la historia no existe", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(tagRepository.addTagToStory("story-999", "tag-1")).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar NotFoundError si la etiqueta no existe", async () => {
      prisma.story.findUnique.mockResolvedValue({ id: "story-1" });
      prisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagRepository.addTagToStory("story-1", "tag-999")).rejects.toThrow(NotFoundError);
    });
  });

  describe("removeTagFromStory", () => {
    it("debe remover una etiqueta de una historia", async () => {
      prisma.storyTag.delete.mockResolvedValue({ storyId: "story-1", tagId: "tag-1" });

      const result = await tagRepository.removeTagFromStory("story-1", "tag-1");

      expect(prisma.storyTag.delete).toHaveBeenCalledWith({
        where: { storyId_tagId: { storyId: "story-1", tagId: "tag-1" } },
      });
    });
  });

  describe("getStoryTags", () => {
    it("debe obtener todas las etiquetas de una historia", async () => {
      const mockStoryTags = [
        { storyId: "story-1", tagId: "tag-1", tag: { id: "tag-1", name: "Magia" } },
        { storyId: "story-1", tagId: "tag-2", tag: { id: "tag-2", name: "Aventura" } },
      ];

      prisma.storyTag.findMany.mockResolvedValue(mockStoryTags);

      const result = await tagRepository.getStoryTags("story-1");

      expect(result).toEqual(mockStoryTags);
      expect(prisma.storyTag.findMany).toHaveBeenCalledWith({
        where: { storyId: "story-1" },
        include: { tag: true },
      });
    });
  });

  describe("seedDefaultTags", () => {
    it("debe sembrar etiquetas por defecto", async () => {
      prisma.tag.upsert.mockResolvedValue({ id: "tag-1", name: "Drama" });

      await tagRepository.seedDefaultTags();

      expect(prisma.tag.upsert).toHaveBeenCalledTimes(10);
    });
  });
});
