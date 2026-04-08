import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../config/prisma.js";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors.js";

// Mock all dependencies BEFORE importing
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$10$hashed"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("crypto", () => ({
  default: {
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue("hashed-token"),
    }),
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue("random-token-123"),
    }),
  },
}));

// Mock Prisma - must be done before importing auth.service
vi.mock("../../config/prisma.js", () => ({
  default: {
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
  },
}));

vi.mock("../../features/users/user.service.js", () => ({
  getUserByEmail: vi.fn(),
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  findOrCreateOAuthUser: vi.fn(),
}));

// Import after all mocks are set
import * as authService from "../../features/auth/auth.service.js";
import * as userService from "../../features/users/user.service.js";

describe("auth.service", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("saveRefreshToken", () => {
    it("persists a hashed refresh token with expiry and user agent", async () => {
      const expiresAt = new Date("2026-05-01T00:00:00.000Z");

      await authService.saveRefreshToken({
        token: "refresh-token",
        userId: "user-123",
        userAgent: "test-agent",
        expiresAt,
      });

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          tokenHash: "hashed-token",
          userId: "user-123",
          userAgent: "test-agent",
          expiresAt,
        },
      });
    });

    it("uses a default expiry when expiresAt is omitted", async () => {
      await authService.saveRefreshToken({
        token: "refresh-token",
        userId: "user-123",
      });

      expect(prisma.refreshToken.create).toHaveBeenCalled();
      const callData = prisma.refreshToken.create.mock.calls[0][0].data;
      expect(callData.tokenHash).toBe("hashed-token");
      expect(callData.userId).toBe("user-123");
      expect(callData.userAgent).toBe("unknown");
      expect(callData.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("verifyRefreshToken", () => {
    it("returns session data when token exists and is valid", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: "user-123",
        revoked: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      const result = await authService.verifyRefreshToken("refresh-token");

      expect(result.userId).toBe("user-123");
      expect(result.token.revoked).toBe(false);
    });

    it("throws UnauthorizedError when refresh token is missing", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(
        authService.verifyRefreshToken("refresh-token"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when refresh token is revoked", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: "user-123",
        revoked: true,
        expiresAt: new Date(Date.now() + 10000),
      });

      await expect(
        authService.verifyRefreshToken("refresh-token"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when refresh token is expired", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: "user-123",
        revoked: false,
        expiresAt: new Date(Date.now() - 10000),
      });

      await expect(
        authService.verifyRefreshToken("refresh-token"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("revokeRefreshToken", () => {
    it("revokes an existing refresh token", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: "user-123",
        revoked: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      await authService.revokeRefreshToken("refresh-token");

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { tokenHash: "hashed-token" },
        data: {
          revoked: true,
          revokedAt: expect.any(Date),
        },
      });
    });

    it("throws NotFoundError when refresh token does not exist", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(
        authService.revokeRefreshToken("refresh-token"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("requestPasswordReset", () => {
    it("returns the token in non-production environments", async () => {
      userService.getUserByEmail.mockResolvedValue({ id: "user-123" });
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      try {
        const result = await authService.requestPasswordReset({
          email: "test@example.com",
        });

        expect(prisma.passwordReset.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: "user-123",
            tokenHash: "hashed-token",
            expiresAt: expect.any(Date),
          }),
        });
        expect(result).toEqual({
          message: "Reset password token generated. Revisa tu email.",
          token: "random-token-123",
        });
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("does not return the token in production responses", async () => {
      userService.getUserByEmail.mockResolvedValue({ id: "user-123" });
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const result = await authService.requestPasswordReset({
          email: "test@example.com",
        });

        expect(result).toEqual({
          message: "Reset password token generated. Revisa tu email.",
        });
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("isValidPassword", () => {
    it("should return true for valid passwords", () => {
      expect(authService.isValidPassword("Password123!")).toBe(true);
      expect(authService.isValidPassword("MyP@ssw0rd")).toBe(true);
      expect(authService.isValidPassword("Test1234#")).toBe(true);
    });

    it("should return false for invalid passwords", () => {
      expect(authService.isValidPassword("password123")).toBe(false); // No uppercase
      expect(authService.isValidPassword("PASSWORD123")).toBe(false); // No lowercase
      expect(authService.isValidPassword("Password")).toBe(false); // No number or special char
      expect(authService.isValidPassword("Pass123")).toBe(false); // Less than 8 chars
    });
  });
});
