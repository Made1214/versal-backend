import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStory = {
  id: 'story-123',
  title: 'Test Story',
  description: 'Test description',
  coverImage: 'https://example.com/cover.jpg',
  authorId: 'user-123',
  categoryId: 'cat-123',
  status: 'DRAFT',
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  author: { username: 'testuser', profileImage: 'avatar.jpg' },
  category: { name: 'Fantasy' },
  tags: [{ tag: { name: 'magic' } }],
};

// Mock dependencies
vi.mock('../../config/prisma.js', () => ({
  default: {
    story: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
    },
    chapter: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    comment: {
      deleteMany: vi.fn(),
    },
    favorite: {
      deleteMany: vi.fn(),
    },
    storyTag: {
      deleteMany: vi.fn(),
    },
  },
}));

import * as storyService from '../../features/stories/story.service.js';
import prisma from '../../config/prisma.js';

describe('Story Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStoryById', () => {
    it('should return story when exists', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);

      const result = await storyService.getStoryById('story-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('story-123');
      expect(result.tags).toEqual([{ name: 'magic' }]);
    });

    it('should throw error when story not found', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(
        storyService.getStoryById('nonexistent')
      ).rejects.toThrow('Historia no encontrada');
    });
  });

  describe('createStory', () => {
    it('should create story successfully', async () => {
      const newStory = {
        title: 'New Story',
        description: 'New description',
        authorId: 'user-123',
        category: 'Fantasy',
        tags: ['magic'],
      };
      
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123' });
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-123', name: 'Fantasy' });
      prisma.tag.findMany.mockResolvedValue([{ id: 'tag-123', name: 'magic' }]);
      prisma.story.create.mockResolvedValue(mockStory);

      const result = await storyService.createStory(newStory);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Story');
    });

    it('should throw error when author not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        storyService.createStory({ authorId: 'nonexistent', title: 'Test' })
      ).rejects.toThrow('Autor no encontrado');
    });
  });

  describe('getAllStories', () => {
    it('should return published stories', async () => {
      prisma.story.findMany.mockResolvedValue([mockStory]);

      const result = await storyService.getAllStories();

      expect(result).toHaveLength(1);
      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            isDeleted: false,
          }),
        })
      );
    });
  });

  describe('getStoriesByAuthor', () => {
    it('should return stories by author', async () => {
      prisma.story.findMany.mockResolvedValue([mockStory]);

      const result = await storyService.getStoriesByAuthor('user-123');

      expect(result).toHaveLength(1);
      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { authorId: 'user-123', isDeleted: false },
        })
      );
    });
  });

  describe('deleteStory', () => {
    it('should delete story and related data', async () => {
      prisma.chapter.findMany.mockResolvedValue([{ id: 'ch-1' }]);
      prisma.comment.deleteMany.mockResolvedValue({ count: 1 });
      prisma.chapter.deleteMany.mockResolvedValue({ count: 1 });
      prisma.favorite.deleteMany.mockResolvedValue({ count: 1 });
      prisma.story.delete.mockResolvedValue(mockStory);

      const result = await storyService.deleteStory('story-123');

      expect(result).toHaveProperty('message');
      expect(prisma.story.delete).toHaveBeenCalled();
    });
  });
});
