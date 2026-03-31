import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChapter = {
  id: 'chapter-123',
  storyId: 'story-123',
};

const mockLike = {
  id: 'like-123',
  userId: 'user-123',
  chapterId: 'chapter-123',
  createdAt: new Date('2024-01-01'),
};

const mockComment = {
  id: 'comment-123',
  content: 'Great chapter!',
  userId: 'user-123',
  chapterId: 'chapter-123',
  isDeleted: false,
  createdAt: new Date('2024-01-01'),
  user: { username: 'testuser', profileImage: 'avatar.jpg' },
  replies: [],
};

// Mock dependencies
vi.mock('../../config/prisma.js', () => ({
  default: {
    chapter: {
      findUnique: vi.fn(),
    },
    chapterLike: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    story: {
      update: vi.fn(),
    },
  },
}));

import * as interactionService from '../../features/interactions/interaction.service.js';
import prisma from '../../config/prisma.js';

describe('Interaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addInteractionToChapter - likes', () => {
    it('should add like when not exists', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);
      prisma.chapterLike.findUnique.mockResolvedValue(null);
      prisma.chapterLike.create.mockResolvedValue(mockLike);
      prisma.chapterLike.count.mockResolvedValue(1);
      prisma.story.update.mockResolvedValue({});

      const result = await interactionService.addInteractionToChapter({
        chapterId: 'chapter-123',
        userId: 'user-123',
        interactionType: 'like',
      });

      expect(result.status).toBe('liked');
      expect(result.message).toContain('Me gusta');
      expect(prisma.chapterLike.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', chapterId: 'chapter-123' },
      });
    });

    it('should remove like when exists', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);
      prisma.chapterLike.findUnique.mockResolvedValue(mockLike);
      prisma.chapterLike.delete.mockResolvedValue(mockLike);
      prisma.chapterLike.count.mockResolvedValue(0);
      prisma.story.update.mockResolvedValue({});

      const result = await interactionService.addInteractionToChapter({
        chapterId: 'chapter-123',
        userId: 'user-123',
        interactionType: 'like',
      });

      expect(result.status).toBe('unliked');
      expect(result.message).toContain('quitado');
      expect(prisma.chapterLike.delete).toHaveBeenCalled();
    });

    it('should throw error when chapter not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      await expect(
        interactionService.addInteractionToChapter({
          chapterId: 'nonexistent',
          userId: 'user-123',
          interactionType: 'like',
        })
      ).rejects.toThrow('Capítulo no encontrado');
    });
  });

  describe('addInteractionToChapter - comments', () => {
    it('should create comment successfully', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await interactionService.addInteractionToChapter({
        chapterId: 'chapter-123',
        userId: 'user-123',
        interactionType: 'comment',
        text: 'Great chapter!',
      });

      expect(result.comment).toBeDefined();
      expect(result.message).toContain('Comentario publicado');
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Great chapter!',
          userId: 'user-123',
          chapterId: 'chapter-123',
        },
        include: {
          user: { select: { username: true, profileImage: true } },
        },
      });
    });

    it('should throw error when comment text is missing', async () => {
      await expect(
        interactionService.addInteractionToChapter({
          chapterId: 'chapter-123',
          userId: 'user-123',
          interactionType: 'comment',
        })
      ).rejects.toThrow('El texto del comentario es requerido');
    });

    it('should throw error when chapter not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      await expect(
        interactionService.addInteractionToChapter({
          chapterId: 'nonexistent',
          userId: 'user-123',
          interactionType: 'comment',
          text: 'Test',
        })
      ).rejects.toThrow('Capítulo no encontrado');
    });
  });

  describe('addInteractionToChapter - invalid type', () => {
    it('should throw error for invalid interaction type', async () => {
      await expect(
        interactionService.addInteractionToChapter({
          chapterId: 'chapter-123',
          userId: 'user-123',
          interactionType: 'invalid',
        })
      ).rejects.toThrow('Tipo de interacción inválido');
    });
  });

  describe('getInteractionsForChapter', () => {
    it('should return likes and comments for chapter', async () => {
      prisma.chapter.findUnique.mockResolvedValue(mockChapter);
      prisma.chapterLike.findMany.mockResolvedValue([mockLike]);
      prisma.comment.findMany.mockResolvedValue([mockComment]);

      const result = await interactionService.getInteractionsForChapter('chapter-123');

      expect(result.interactions).toBeDefined();
      expect(result.interactions.likes).toHaveLength(1);
      expect(result.interactions.comments).toHaveLength(1);
    });

    it('should throw error when chapter not found', async () => {
      prisma.chapter.findUnique.mockResolvedValue(null);

      await expect(
        interactionService.getInteractionsForChapter('nonexistent')
      ).rejects.toThrow('Capítulo no encontrado');
    });
  });

  describe('deleteInteraction', () => {
    it('should delete comment when user is owner', async () => {
      const comment = { ...mockComment, userId: 'user-123' };
      prisma.comment.findUnique.mockResolvedValue(comment);
      prisma.comment.update.mockResolvedValue({ ...comment, isDeleted: true });

      const result = await interactionService.deleteInteraction({
        interactionId: 'comment-123',
        userId: 'user-123',
        userRole: 'user',
      });

      expect(result.message).toContain('eliminado exitosamente');
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'comment-123' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should delete comment when user is admin', async () => {
      const comment = { ...mockComment, userId: 'other-user' };
      prisma.comment.findUnique.mockResolvedValue(comment);
      prisma.comment.update.mockResolvedValue({ ...comment, isDeleted: true });

      const result = await interactionService.deleteInteraction({
        interactionId: 'comment-123',
        userId: 'admin-user',
        userRole: 'admin',
      });

      expect(result.message).toContain('eliminado exitosamente');
    });

    it('should throw error when user is not owner and not admin', async () => {
      const comment = { ...mockComment, userId: 'other-user' };
      prisma.comment.findUnique.mockResolvedValue(comment);

      await expect(
        interactionService.deleteInteraction({
          interactionId: 'comment-123',
          userId: 'user-123',
          userRole: 'user',
        })
      ).rejects.toThrow('No autorizado para eliminar este comentario');
    });

    it('should throw error when comment not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        interactionService.deleteInteraction({
          interactionId: 'nonexistent',
          userId: 'user-123',
          userRole: 'user',
        })
      ).rejects.toThrow('Comentario no encontrado');
    });
  });
});
