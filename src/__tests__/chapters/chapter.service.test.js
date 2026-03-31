import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChapter = {
  id: 'chapter-123',
  title: 'Chapter 1',
  content: 'Chapter content',
  chapterNumber: 1,
  storyId: 'story-123',
  status: 'published',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  story: { title: 'Test Story', authorId: 'user-123' },
};

// Mock dependencies
vi.mock('../../config/prisma.js', () => ({
  default: {
    chapter: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    story: {
      update: vi.fn(),
    },
  },
}));

import * as chapterService from '../../features/chapters/chapter.service.js';
import prisma from '../../config/prisma.js';

describe('Chapter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChapterById', () => {
    it('should return chapter when exists', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);

      const result = await chapterService.getChapterById('chapter-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('chapter-123');
      expect(prisma.chapter.findUnique).toHaveBeenCalledWith({
        where: { id: 'chapter-123' },
        include: { story: { select: { title: true, authorId: true } } },
      });
    });

    it('should throw error when chapter not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      await expect(
        chapterService.getChapterById('nonexistent')
      ).rejects.toThrow('Capítulo no encontrado');
    });
  });

  describe('createChapter', () => {
    it('should create chapter successfully', async () => {
      const newChapter = {
        title: 'New Chapter',
        content: 'Content',
        chapterNumber: 2,
        storyId: 'story-123',
      };
      prisma.chapter.create.mockResolvedValue({ ...mockChapter, ...newChapter });

      const result = await chapterService.createChapter(newChapter);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Chapter');
      expect(prisma.chapter.create).toHaveBeenCalledWith({
        data: newChapter,
      });
    });
  });

  describe('updateChapter', () => {
    it('should update chapter successfully', async () => {
      const updateData = { title: 'Updated Chapter' };
      prisma.chapter.update.mockResolvedValue({ ...mockChapter, ...updateData });

      const result = await chapterService.updateChapter('chapter-123', updateData);

      expect(result.title).toBe('Updated Chapter');
      expect(prisma.chapter.update).toHaveBeenCalled();
    });

    it('should update story status when chapter is published', async () => {
      const updateData = { status: 'published' };
      prisma.chapter.update.mockResolvedValue({ ...mockChapter, ...updateData });
      prisma.story.update.mockResolvedValue({});

      await chapterService.updateChapter('chapter-123', updateData);

      expect(prisma.story.update).toHaveBeenCalledWith({
        where: { id: 'story-123' },
        data: { status: 'published' },
      });
    });
  });

  describe('deleteChapter', () => {
    it('should delete chapter successfully', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);
      prisma.chapter.delete.mockResolvedValue(mockChapter);

      const result = await chapterService.deleteChapter('chapter-123');

      expect(result).toBeDefined();
      expect(prisma.chapter.delete).toHaveBeenCalledWith({
        where: { id: 'chapter-123' },
      });
    });

    it('should throw error when chapter not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      await expect(
        chapterService.deleteChapter('nonexistent')
      ).rejects.toThrow('Capítulo no encontrado');
    });
  });

  describe('getChaptersByStory', () => {
    it('should return chapters for a story', async () => {
      prisma.chapter.findMany.mockResolvedValue([mockChapter]);

      const result = await chapterService.getChaptersByStory('story-123');

      expect(result).toHaveLength(1);
      expect(result[0].storyId).toBe('story-123');
      expect(prisma.chapter.findMany).toHaveBeenCalledWith({
        where: { storyId: 'story-123' },
        orderBy: { chapterNumber: 'asc' },
      });
    });
  });

  describe('getPublishedChapterCount', () => {
    it('should return count of published chapters', async () => {
      prisma.chapter.count.mockResolvedValue(5);

      const result = await chapterService.getPublishedChapterCount('story-123');

      expect(result).toBe(5);
      expect(prisma.chapter.count).toHaveBeenCalledWith({
        where: { storyId: 'story-123', status: 'published' },
      });
    });
  });
});
