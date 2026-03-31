import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChapter = {
  id: "chapter-123",
  title: "Chapter 1",
  content: "Chapter content",
  chapterNumber: 1,
  storyId: "story-123",
  status: "published",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  story: { title: "Test Story", authorId: "user-123" },
};

vi.mock("../../repositories/chapter.repository.js");
vi.mock("../../repositories/story.repository.js");

import * as chapterService from "../../features/chapters/chapter.service.js";
import * as chapterRepo from "../../repositories/chapter.repository.js";
import * as storyRepo from "../../repositories/story.repository.js";

describe("Chapter Service", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getChapterById", () => {
    it("retorna capítulo cuando existe", async () => {
      chapterRepo.findById.mockResolvedValue(mockChapter);
      const result = await chapterService.getChapterById("chapter-123");
      expect(result.id).toBe("chapter-123");
      expect(chapterRepo.findById).toHaveBeenCalledWith("chapter-123");
    });

    it("lanza error si no existe", async () => {
      chapterRepo.findById.mockResolvedValue(null);
      await expect(chapterService.getChapterById("no-existe")).rejects.toThrow("Capítulo no encontrado");
    });
  });

  describe("createChapter", () => {
    it("crea capítulo correctamente", async () => {
      const data = { title: "New Chapter", content: "Content", chapterNumber: 2, storyId: "story-123" };
      chapterRepo.create.mockResolvedValue({ ...mockChapter, ...data });
      const result = await chapterService.createChapter(data);
      expect(result.title).toBe("New Chapter");
      expect(chapterRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe("updateChapter", () => {
    it("actualiza capítulo correctamente", async () => {
      chapterRepo.update.mockResolvedValue({ ...mockChapter, title: "Updated" });
      const result = await chapterService.updateChapter("chapter-123", { title: "Updated" });
      expect(result.title).toBe("Updated");
    });

    it("publica la historia cuando el capítulo se publica", async () => {
      chapterRepo.update.mockResolvedValue({ ...mockChapter, status: "published" });
      storyRepo.update.mockResolvedValue({});
      await chapterService.updateChapter("chapter-123", { status: "published" });
      expect(storyRepo.update).toHaveBeenCalledWith("story-123", { status: "published" });
    });
  });

  describe("deleteChapter", () => {
    it("elimina capítulo correctamente", async () => {
      chapterRepo.findById.mockResolvedValue(mockChapter);
      chapterRepo.remove.mockResolvedValue({});
      const result = await chapterService.deleteChapter("chapter-123");
      expect(result.id).toBe("chapter-123");
      expect(chapterRepo.remove).toHaveBeenCalledWith("chapter-123");
    });

    it("lanza error si no existe", async () => {
      chapterRepo.findById.mockResolvedValue(null);
      await expect(chapterService.deleteChapter("no-existe")).rejects.toThrow("Capítulo no encontrado");
    });
  });

  describe("getChaptersByStory", () => {
    it("retorna capítulos de una historia", async () => {
      chapterRepo.findByStory.mockResolvedValue([mockChapter]);
      const result = await chapterService.getChaptersByStory("story-123");
      expect(result).toHaveLength(1);
      expect(chapterRepo.findByStory).toHaveBeenCalledWith("story-123");
    });
  });

  describe("getPublishedChapterCount", () => {
    it("retorna cantidad de capítulos publicados", async () => {
      chapterRepo.countPublished.mockResolvedValue(5);
      const result = await chapterService.getPublishedChapterCount("story-123");
      expect(result).toBe(5);
      expect(chapterRepo.countPublished).toHaveBeenCalledWith("story-123");
    });
  });
});
