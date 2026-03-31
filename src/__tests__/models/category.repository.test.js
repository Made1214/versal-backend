import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../config/prisma.js";
import * as categoryRepository from "../../repositories/category.repository.js";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors.js";

// Mock de Prisma
vi.mock("../../config/prisma.js");

describe("Category Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCategory", () => {
    it("debe crear una categoría con datos válidos", async () => {
      const categoryData = { name: "Aventura" };
      const mockCategory = { id: "cat-1", name: "Aventura" };

      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await categoryRepository.createCategory(categoryData);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: "Aventura" },
      });
    });

    it("debe lanzar ValidationError si falta name", async () => {
      await expect(categoryRepository.createCategory({})).rejects.toThrow(ValidationError);
    });

    it("debe lanzar ConflictError si la categoría ya existe", async () => {
      const categoryData = { name: "Aventura" };

      prisma.category.findUnique.mockResolvedValue({ id: "cat-1", name: "Aventura" });

      await expect(categoryRepository.createCategory(categoryData)).rejects.toThrow(ConflictError);
    });
  });

  describe("getCategoryById", () => {
    it("debe obtener una categoría por ID", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Aventura",
        stories: [],
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryRepository.getCategoryById("cat-1");

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "cat-1" },
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la categoría no existe", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryRepository.getCategoryById("cat-999")).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ValidationError si falta categoryId", async () => {
      await expect(categoryRepository.getCategoryById(null)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCategoryByName", () => {
    it("debe obtener una categoría por nombre", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Aventura",
        stories: [],
      };

      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryRepository.getCategoryByName("Aventura");

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: "Aventura" },
        include: expect.any(Object),
      });
    });

    it("debe lanzar NotFoundError si la categoría no existe", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryRepository.getCategoryByName("NoExiste")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAllCategories", () => {
    it("debe obtener todas las categorías con paginación", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Aventura", _count: { stories: 5 } },
        { id: "cat-2", name: "Romance", _count: { stories: 3 } },
      ];

      prisma.category.findMany.mockResolvedValue(mockCategories);
      prisma.category.count.mockResolvedValue(2);

      const result = await categoryRepository.getAllCategories({ page: 1, limit: 50 });

      expect(result.categories).toEqual(mockCategories);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe("updateCategory", () => {
    it("debe actualizar una categoría", async () => {
      const updateData = { name: "Aventura Épica" };
      const mockCategory = { id: "cat-1", name: "Aventura Épica" };

      prisma.category.findUnique.mockResolvedValueOnce({ id: "cat-1", name: "Aventura" });
      prisma.category.findUnique.mockResolvedValueOnce(null);
      prisma.category.update.mockResolvedValue(mockCategory);

      const result = await categoryRepository.updateCategory("cat-1", updateData);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: "cat-1" },
        data: { name: "Aventura Épica" },
      });
    });

    it("debe lanzar NotFoundError si la categoría no existe", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryRepository.updateCategory("cat-999", {})).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ConflictError si el nuevo nombre ya existe", async () => {
      prisma.category.findUnique.mockResolvedValueOnce({ id: "cat-1", name: "Aventura" });
      prisma.category.findUnique.mockResolvedValueOnce({ id: "cat-2", name: "Romance" });

      await expect(categoryRepository.updateCategory("cat-1", { name: "Romance" })).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe("deleteCategory", () => {
    it("debe eliminar una categoría sin historias", async () => {
      const mockCategory = { id: "cat-1", name: "Aventura" };

      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.story.count.mockResolvedValue(0);
      prisma.category.delete.mockResolvedValue(mockCategory);

      const result = await categoryRepository.deleteCategory("cat-1");

      expect(result).toEqual(mockCategory);
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      });
    });

    it("debe lanzar ValidationError si la categoría tiene historias", async () => {
      prisma.category.findUnique.mockResolvedValue({ id: "cat-1", name: "Aventura" });
      prisma.story.count.mockResolvedValue(5);

      await expect(categoryRepository.deleteCategory("cat-1")).rejects.toThrow(ValidationError);
    });

    it("debe lanzar NotFoundError si la categoría no existe", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryRepository.deleteCategory("cat-999")).rejects.toThrow(NotFoundError);
    });
  });

  describe("seedDefaultCategories", () => {
    it("debe sembrar categorías por defecto", async () => {
      prisma.category.upsert.mockResolvedValue({ id: "cat-1", name: "Acción" });

      await categoryRepository.seedDefaultCategories();

      expect(prisma.category.upsert).toHaveBeenCalledTimes(9);
    });
  });
});
