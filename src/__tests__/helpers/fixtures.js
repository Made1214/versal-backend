/**
 * Fixtures - Datos de prueba reutilizables
 * Estos objetos simulan datos reales del sistema para usar en tests
 */

/**
 * Usuario de prueba básico
 */
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  fullName: 'Test User',
  password: '$2b$10$hashedPassword123',
  role: 'user',
  bio: 'Test bio',
  profileImage: 'https://example.com/avatar.jpg',
  coins: 100,
  subscriptionType: 'BASIC',
  subscriptionEndDate: null,
  stripeCustomerId: null,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Usuario administrador de prueba
 */
export const mockAdminUser = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  username: 'adminuser',
  fullName: 'Admin User',
  role: 'admin',
};

/**
 * Usuario premium de prueba
 */
export const mockPremiumUser = {
  ...mockUser,
  id: 'premium-123',
  email: 'premium@example.com',
  username: 'premiumuser',
  fullName: 'Premium User',
  subscriptionType: 'PREMIUM',
  coins: 500,
};

/**
 * Historia de prueba
 */
export const mockStory = {
  id: 'story-123',
  title: 'Test Story',
  description: 'This is a test story description',
  coverImage: 'https://example.com/cover.jpg',
  authorId: 'user-123',
  categoryId: 'cat-123',
  status: 'PUBLISHED',
  isDeleted: false,
  viewCount: 100,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Historia en borrador
 */
export const mockDraftStory = {
  ...mockStory,
  id: 'story-draft-123',
  title: 'Draft Story',
  status: 'DRAFT',
  viewCount: 0,
};

/**
 * Capítulo de prueba
 */
export const mockChapter = {
  id: 'chapter-123',
  title: 'Chapter 1: The Beginning',
  content: 'This is the content of chapter 1...',
  chapterNumber: 1,
  storyId: 'story-123',
  status: 'published',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Capítulo en borrador
 */
export const mockDraftChapter = {
  ...mockChapter,
  id: 'chapter-draft-123',
  title: 'Chapter 2: Draft',
  chapterNumber: 2,
  status: 'draft',
};

/**
 * Categoría de prueba
 */
export const mockCategory = {
  id: 'cat-123',
  name: 'Fantasy',
  description: 'Fantasy stories',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Tag de prueba
 */
export const mockTag = {
  id: 'tag-123',
  name: 'Adventure',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Comentario de prueba
 */
export const mockComment = {
  id: 'comment-123',
  content: 'Great chapter!',
  userId: 'user-123',
  chapterId: 'chapter-123',
  parentId: null,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Like de capítulo de prueba
 */
export const mockChapterLike = {
  id: 'like-123',
  userId: 'user-123',
  chapterId: 'chapter-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Favorito de prueba
 */
export const mockFavorite = {
  id: 'favorite-123',
  userId: 'user-123',
  storyId: 'story-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Relación de seguimiento de prueba
 */
export const mockFollow = {
  id: 'follow-123',
  followerId: 'user-123',
  followeeId: 'user-456',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Bloqueo de usuario de prueba
 */
export const mockBlock = {
  id: 'block-123',
  blockerId: 'user-123',
  blockedId: 'user-456',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Reporte de prueba
 */
export const mockReport = {
  id: 'report-123',
  userId: 'user-123',
  contentId: 'story-123',
  target: 'STORY',
  reason: 'INAPPROPRIATE_CONTENT',
  details: 'This story contains inappropriate content',
  status: 'PENDING',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Transacción de prueba
 */
export const mockTransaction = {
  id: 'transaction-123',
  userId: 'user-123',
  type: 'SUBSCRIPTION',
  amount: 9.99,
  currency: 'usd',
  status: 'COMPLETED',
  metadata: {
    planId: 'price_test_123',
    stripeCheckoutSessionId: 'cs_test_123',
  },
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Donación de prueba
 */
export const mockDonation = {
  id: 'donation-123',
  donatorId: 'user-123',
  recipientId: 'user-456',
  storyId: 'story-123',
  amount: 50,
  message: 'Great story! Keep writing!',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Refresh token de prueba
 */
export const mockRefreshToken = {
  id: 'refresh-123',
  userId: 'user-123',
  token: 'hashed-refresh-token-abc123',
  expiresAt: new Date('2024-12-31T23:59:59.000Z'),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Password reset token de prueba
 */
export const mockPasswordReset = {
  id: 'reset-123',
  userId: 'user-123',
  token: 'hashed-reset-token-xyz789',
  expiresAt: new Date('2024-01-02T00:00:00.000Z'),
  used: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * Historia con relaciones completas (para tests de integración)
 */
export const mockStoryWithRelations = {
  ...mockStory,
  author: {
    username: mockUser.username,
    profileImage: mockUser.profileImage,
  },
  category: {
    name: mockCategory.name,
  },
  tags: [
    {
      tag: {
        name: mockTag.name,
      },
    },
  ],
};

/**
 * Capítulo con relaciones completas
 */
export const mockChapterWithRelations = {
  ...mockChapter,
  story: {
    title: mockStory.title,
    authorId: mockStory.authorId,
  },
};

/**
 * Comentario con relaciones completas
 */
export const mockCommentWithRelations = {
  ...mockComment,
  user: {
    username: mockUser.username,
    profileImage: mockUser.profileImage,
  },
  replies: [],
};
