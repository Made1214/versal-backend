import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../config/prisma.js";
import * as chapterRepo from "../../repositories/chapter.repository.js";

vi.mock("../../config/prisma.js");

describe("Chapter Repository", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("findById", () => {
    it("retorna capítulo con story incluida", async () => {
      const mock = { id: "c1", title: "Cap 1", story: { title: "Historia", authorId: "u1" } };
      prisma.chapter.findUnique.mockResolvedValue(mock);
      const result = await chapterRepo.findById("c1");
      expect(result).toEqual(mock);
      expect(prisma.chapter.findUnique).toHaveBeenCalledWith({
        where: { id: "c1" },
        include: { story: { select: { title: true, authorId: true } } },
      });
    });

    it("retorna null si no existe", async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);
      expect(await chapterRepo.findById("no-existe")).toBeNull();
    });
  });

  describe("findByStory", () => {
    it("retorna capítulos ordenados por número", async () => {
      const mock = [{ id: "c1", chapterNumber: 1 }, { id: "c2", chapterNumber: 2 }];
      prisma.chapter.findMany.mockResolvedValue(mock);
      const result = await chapterRepo.findByStory("s1");
      expect(prisma.chapter.findMany).toHaveBeenCalledWith({
        where: { storyId: "s1" },
        orderBy: { chapterNumber: "asc" },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("crea capítulo", async () => {
      const data = { storyId: "s1", title: "Cap 1", content: "...", chapterNumber: 1 };
      prisma.chapter.create.mockResolvedValue({ id: "c1", ...data });
      const result = await chapterRepo.create(data);
      expect(prisma.chapter.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe("c1");
    });
  });

  describe("update", () => {
    it("actualiza capítulo", async () => {
      prisma.chapter.update.mockResolvedValue({ id: "c1", title: "Nuevo título" });
      const result = await chapterRepo.update("c1", { title: "Nuevo título" });
      expect(prisma.chapter.update).toHaveBeenCalledWith({ where: { id: "c1" }, data: { title: "Nuevo título" } });
      expect(result.title).toBe("Nuevo título");
    });
  });

  describe("remove", () => {
    it("elimina capítulo", async () => {
      prisma.chapter.delete.mockResolvedValue({ id: "c1" });
      await chapterRepo.remove("c1");
      expect(prisma.chapter.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
    });
  });

  describe("countPublished", () => {
    it("cuenta capítulos publicados", async () => {
      prisma.chapter.count.mockResolvedValue(3);
      const result = await chapterRepo.countPublished("s1");
      expect(prisma.chapter.count).toHaveBeenCalledWith({ where: { storyId: "s1", status: "published" } });
      expect(result).toBe(3);
    });
  });
});
