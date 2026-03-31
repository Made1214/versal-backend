import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies BEFORE importing
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashed'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('crypto', () => ({
  default: {
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed-token'),
    }),
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('random-token-123'),
    }),
  },
}));

// Mock Prisma - must be done before importing auth.service
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  passwordReset: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../config/prisma', () => ({
  default: mockPrisma,
}));

vi.mock('../users/user.service', () => ({
  default: {
    getUserByEmail: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    findOrCreateOAuthUser: vi.fn(),
  },
}));

// Import after all mocks are set
const authService = require('../../features/auth/auth.service');

describe('auth.service', () => {
  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(authService.isValidPassword('Password123!')).toBe(true);
      expect(authService.isValidPassword('MyP@ssw0rd')).toBe(true);
      expect(authService.isValidPassword('Test1234#')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(authService.isValidPassword('password123')).toBe(false); // No uppercase
      expect(authService.isValidPassword('PASSWORD123')).toBe(false); // No lowercase
      expect(authService.isValidPassword('Password')).toBe(false); // No number or special char
      expect(authService.isValidPassword('Pass123')).toBe(false); // Less than 8 chars
    });
  });
});
