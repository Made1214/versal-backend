import { describe, it, expect } from "vitest";
import prisma from "../../config/prisma.js";
import * as interactionRepo from "../../repositories/interaction.repository.js";

describe("Interaction Repository", () => {

  describe("findLike", () => {
    it("retorna like si existe", async () => {
      prisma.chapterLike.findUnique.mockResolvedValue({ userId: "u1", chapterId: "c1" });
      const result = await interactionRepo.findLike("u1", "c1");
      expect(result).toBeTruthy();
      expect(prisma.chapterLike.findUnique).toHaveBeenCalledWith({
        where: { userId_chapterId: { userId: "u1", chapterId: "c1" } },
      });
    });

    it("retorna null si no existe", async () => {
      prisma.chapterLike.findUnique.mockResolvedValue(null);
      expect(await interactionRepo.findLike("u1", "c1")).toBeNull();
    });
  });

  describe("createLike", () => {
    it("crea like", async () => {
      prisma.chapterLike.create.mockResolvedValue({ userId: "u1", chapterId: "c1" });
      await interactionRepo.createLike("u1", "c1");
      expect(prisma.chapterLike.create).toHaveBeenCalledWith({ data: { userId: "u1", chapterId: "c1" } });
    });
  });

  describe("deleteLike", () => {
    it("elimina like", async () => {
      prisma.chapterLike.delete.mockResolvedValue({});
      await interactionRepo.deleteLike("u1", "c1");
      expect(prisma.chapterLike.delete).toHaveBeenCalledWith({
        where: { userId_chapterId: { userId: "u1", chapterId: "c1" } },
      });
    });
  });

  describe("countLikesByStory", () => {
    it("cuenta likes de una historia", async () => {
      prisma.chapterLike.count.mockResolvedValue(10);
      const result = await interactionRepo.countLikesByStory("s1");
      expect(prisma.chapterLike.count).toHaveBeenCalledWith({ where: { chapter: { storyId: "s1" } } });
      expect(result).toBe(10);
    });
  });

  describe("findCommentById", () => {
    it("retorna comentario con chapter incluido", async () => {
      const mock = { id: "cm1", content: "Hola", chapter: { storyId: "s1" } };
      prisma.comment.findUnique.mockResolvedValue(mock);
      const result = await interactionRepo.findCommentById("cm1");
      expect(result).toEqual(mock);
    });
  });

  describe("createComment", () => {
    it("crea comentario con usuario incluido", async () => {
      const mock = { id: "cm1", content: "Hola", user: { username: "user1", profileImage: null } };
      prisma.comment.create.mockResolvedValue(mock);
      const result = await interactionRepo.createComment("u1", "c1", "Hola");
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { content: "Hola", userId: "u1", chapterId: "c1" },
        include: { user: { select: { username: true, profileImage: true } } },
      });
      expect(result.content).toBe("Hola");
    });
  });

  describe("softDeleteComment", () => {
    it("marca comentario como eliminado", async () => {
      prisma.comment.update.mockResolvedValue({ id: "cm1", isDeleted: true });
      const result = await interactionRepo.softDeleteComment("cm1");
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: "cm1" },
        data: expect.objectContaining({ isDeleted: true }),
      });
      expect(result.isDeleted).toBe(true);
    });
  });

  describe("findCommentsByChapter", () => {
    it("retorna comentarios no eliminados con replies", async () => {
      prisma.comment.findMany.mockResolvedValue([{ id: "cm1", content: "Hola", replies: [] }]);
      const result = await interactionRepo.findCommentsByChapter("c1");
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { chapterId: "c1", isDeleted: false } })
      );
      expect(result).toHaveLength(1);
    });
  });
});
