import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFavorite = {
  userId: 'user-123',
  storyId: 'story-123',
  createdAt: new Date('2024-01-01'),
};

const mockStory = {
  id: 'story-123',
  title: 'Test Story',
};

// Mock dependencies
vi.mock('../../config/prisma.js', () => ({
  default: {
    story: {
      findUnique: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import * as favoriteService from '../../features/favorites/favorite.service.js';
import prisma from '../../config/prisma.js';

describe('Favorite Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not exists', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.favorite.findUnique.mockResolvedValue(null);
      prisma.favorite.create.mockResolvedValue(mockFavorite);

      const result = await favoriteService.toggleFavorite('user-123', 'story-123');

      expect(result.status).toBe('favorited');
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', storyId: 'story-123' },
      });
    });

    it('should remove favorite when exists', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.favorite.findUnique.mockResolvedValue(mockFavorite);
      prisma.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await favoriteService.toggleFavorite('user-123', 'story-123');

      expect(result.status).toBe('unfavorited');
      expect(prisma.favorite.delete).toHaveBeenCalled();
    });

    it('should throw error when story not found', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(
        favoriteService.toggleFavorite('user-123', 'nonexistent')
      ).rejects.toThrow('Historia no encontrada');
    });
  });

  describe('checkIsFavorite', () => {
    it('should return true when favorited', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await favoriteService.checkIsFavorite('user-123', 'story-123');

      expect(result.isFavorite).toBe(true);
    });

    it('should return false when not favorited', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.favorite.findUnique.mockResolvedValue(null);

      const result = await favoriteService.checkIsFavorite('user-123', 'story-123');

      expect(result.isFavorite).toBe(false);
    });
  });

  describe('getFavoriteStoriesByUser', () => {
    it('should return favorite stories', async () => {
      const mockFavorites = [
        {
          ...mockFavorite,
          story: {
            ...mockStory,
            author: { username: 'author', profileImage: 'avatar.jpg' },
          },
        },
      ];
      prisma.favorite.findMany.mockResolvedValue(mockFavorites);

      const result = await favoriteService.getFavoriteStoriesByUser('user-123');

      expect(result.stories).toHaveLength(1);
      expect(result.stories[0].title).toBe('Test Story');
    });
  });
});
