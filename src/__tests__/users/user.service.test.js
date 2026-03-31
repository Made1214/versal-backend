import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import fixtures
const mockUser = {
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

const mockAdminUser = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  username: 'adminuser',
  fullName: 'Admin User',
  role: 'admin',
};

// Mock dependencies BEFORE importing service
vi.mock('../../config/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    follow: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    block: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedPassword123'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Import service AFTER mocks
import * as userService from '../../features/users/user.service.js';
import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when exists', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById({ userId: 'user-123' });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
      expect(result.password).toBeUndefined(); // Password should be excluded
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.getUserById({ userId: 'nonexistent' })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error when user is deleted and includeDeleted is false', async () => {
      // Arrange
      const deletedUser = { ...mockUser, isDeleted: true };
      prisma.user.findUnique.mockResolvedValue(deletedUser);

      // Act & Assert
      await expect(
        userService.getUserById({ userId: 'user-123', includeDeleted: false })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should return deleted user when includeDeleted is true', async () => {
      // Arrange
      const deletedUser = { ...mockUser, isDeleted: true };
      prisma.user.findUnique.mockResolvedValue(deletedUser);

      // Act
      const result = await userService.getUserById({
        userId: 'user-123',
        includeDeleted: true,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when email exists', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserByEmail('test@example.com');

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundError when email not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.getUserByEmail('nonexistent@example.com')
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const updateData = { fullName: 'Updated Name', bio: 'New bio' };
      const updatedUser = { ...mockUser, ...updateData };
      prisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUser({
        userId: 'user-123',
        data: updateData,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.fullName).toBe('Updated Name');
      expect(result.bio).toBe('New bio');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
        select: expect.any(Object),
      });
    });

    it('should not allow password update through updateUser', async () => {
      // Arrange
      const updateData = { fullName: 'Updated Name', password: 'newpass' };
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      prisma.user.update.mockResolvedValue(updatedUser);

      // Act
      await userService.updateUser({ userId: 'user-123', data: updateData });

      // Assert
      const callArgs = prisma.user.update.mock.calls[0][0];
      expect(callArgs.data.password).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should change password when old password is correct', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('$2b$10$newHashedPassword');
      prisma.user.update.mockResolvedValue(mockUser);

      // Act
      const result = await userService.changePassword({
        userId: 'user-123',
        oldPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      });

      // Assert
      expect(result).toHaveProperty('message');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'OldPass123!',
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass456!', 10);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw ValidationError when new password is invalid', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        userService.changePassword({
          userId: 'user-123',
          oldPassword: 'OldPass123!',
          newPassword: 'weak', // Invalid password
        })
      ).rejects.toThrow('La nueva contraseña no cumple con los requisitos');
    });

    it('should throw ValidationError when old password is incorrect', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(
        userService.changePassword({
          userId: 'user-123',
          oldPassword: 'WrongPass123!',
          newPassword: 'NewPass456!',
        })
      ).rejects.toThrow('Contraseña antigua incorrecta');
    });
  });

  describe('followUser', () => {
    it('should follow user successfully', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.follow.findUnique.mockResolvedValue(null);
      prisma.follow.create.mockResolvedValue({
        id: 'follow-123',
        followerId: 'user-123',
        followeeId: 'user-456',
      });

      // Act
      const result = await userService.followUser({
        currentUserId: 'user-123',
        targetUserId: 'user-456',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('seguido correctamente');
      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: { followerId: 'user-123', followeeId: 'user-456' },
      });
    });

    it('should throw ValidationError when trying to follow self', async () => {
      // Act & Assert
      await expect(
        userService.followUser({
          currentUserId: 'user-123',
          targetUserId: 'user-123',
        })
      ).rejects.toThrow('No puedes seguirte a ti mismo');
    });

    it('should throw ConflictError when already following', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.follow.findUnique.mockResolvedValue({
        id: 'follow-123',
        followerId: 'user-123',
        followeeId: 'user-456',
      });

      // Act & Assert
      await expect(
        userService.followUser({
          currentUserId: 'user-123',
          targetUserId: 'user-456',
        })
      ).rejects.toThrow('Ya sigues a este usuario');
    });

    it('should throw NotFoundError when target user not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.followUser({
          currentUserId: 'user-123',
          targetUserId: 'nonexistent',
        })
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow user successfully', async () => {
      // Arrange
      prisma.follow.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      const result = await userService.unfollowUser({
        currentUserId: 'user-123',
        targetUserId: 'user-456',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Dejaste de seguir');
      expect(prisma.follow.deleteMany).toHaveBeenCalledWith({
        where: { followerId: 'user-123', followeeId: 'user-456' },
      });
    });

    it('should throw ValidationError when trying to unfollow self', async () => {
      // Act & Assert
      await expect(
        userService.unfollowUser({
          currentUserId: 'user-123',
          targetUserId: 'user-123',
        })
      ).rejects.toThrow('No puedes dejar de seguirte a ti mismo');
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      // Arrange
      prisma.block.findUnique.mockResolvedValue(null);
      prisma.block.create.mockResolvedValue({
        id: 'block-123',
        blockerId: 'user-123',
        blockedId: 'user-456',
      });

      // Act
      const result = await userService.blockUser({
        currentUserId: 'user-123',
        targetUserId: 'user-456',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('bloqueado correctamente');
      expect(prisma.block.create).toHaveBeenCalledWith({
        data: { blockerId: 'user-123', blockedId: 'user-456' },
      });
    });

    it('should throw ValidationError when trying to block self', async () => {
      // Act & Assert
      await expect(
        userService.blockUser({
          currentUserId: 'user-123',
          targetUserId: 'user-123',
        })
      ).rejects.toThrow('No puedes bloquearte a ti mismo');
    });

    it('should throw ConflictError when already blocked', async () => {
      // Arrange
      prisma.block.findUnique.mockResolvedValue({
        id: 'block-123',
        blockerId: 'user-123',
        blockedId: 'user-456',
      });

      // Act & Assert
      await expect(
        userService.blockUser({
          currentUserId: 'user-123',
          targetUserId: 'user-456',
        })
      ).rejects.toThrow('Ya has bloqueado a este usuario');
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      // Arrange
      prisma.block.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      const result = await userService.unblockUser({
        currentUserId: 'user-123',
        targetUserId: 'user-456',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('desbloqueado correctamente');
      expect(prisma.block.deleteMany).toHaveBeenCalledWith({
        where: { blockerId: 'user-123', blockedId: 'user-456' },
      });
    });

    it('should throw ValidationError when trying to unblock self', async () => {
      // Act & Assert
      await expect(
        userService.unblockUser({
          currentUserId: 'user-123',
          targetUserId: 'user-123',
        })
      ).rejects.toThrow('No puedes desbloquearte a ti mismo');
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      // Arrange
      const mockFollowers = [
        {
          follower: {
            id: 'user-456',
            username: 'follower1',
            profileImage: 'https://example.com/avatar1.jpg',
          },
        },
        {
          follower: {
            id: 'user-789',
            username: 'follower2',
            profileImage: 'https://example.com/avatar2.jpg',
          },
        },
      ];
      prisma.follow.findMany.mockResolvedValue(mockFollowers);

      // Act
      const result = await userService.getFollowers({ userId: 'user-123' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('follower1');
      expect(prisma.follow.findMany).toHaveBeenCalledWith({
        where: { followeeId: 'user-123' },
        select: {
          follower: { select: { id: true, username: true, profileImage: true } },
        },
      });
    });
  });

  describe('getFollowing', () => {
    it('should return list of following users', async () => {
      // Arrange
      const mockFollowing = [
        {
          followee: {
            id: 'user-456',
            username: 'following1',
            profileImage: 'https://example.com/avatar1.jpg',
          },
        },
      ];
      prisma.follow.findMany.mockResolvedValue(mockFollowing);

      // Act
      const result = await userService.getFollowing({ userId: 'user-123' });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('following1');
    });
  });

  describe('getBlockedUsers', () => {
    it('should return list of blocked users', async () => {
      // Arrange
      const mockBlocked = [
        {
          blocked: {
            id: 'user-456',
            username: 'blocked1',
            email: 'blocked1@example.com',
          },
        },
      ];
      prisma.block.findMany.mockResolvedValue(mockBlocked);

      // Act
      const result = await userService.getBlockedUsers({ userId: 'user-123' });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('blocked1');
    });
  });

  describe('getAllUsers (Admin)', () => {
    it('should return all users excluding deleted by default', async () => {
      // Arrange
      prisma.user.findMany.mockResolvedValue([mockUser, mockAdminUser]);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        select: expect.any(Object),
      });
    });

    it('should return all users including deleted when specified', async () => {
      // Arrange
      const deletedUser = { ...mockUser, isDeleted: true };
      prisma.user.findMany.mockResolvedValue([mockUser, deletedUser]);

      // Act
      const result = await userService.getAllUsers({ includeDeleted: true });

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.any(Object),
      });
    });
  });

  describe('deleteUser (Admin)', () => {
    it('should soft delete user by default', async () => {
      // Arrange
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        isDeleted: true,
      });

      // Act
      const result = await userService.deleteUser({ userId: 'user-123' });

      // Assert
      expect(result.message).toContain('soft delete');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
    });

    it('should hard delete user when specified', async () => {
      // Arrange
      prisma.user.delete.mockResolvedValue(mockUser);

      // Act
      const result = await userService.deleteUser({
        userId: 'user-123',
        hardDelete: true,
      });

      // Assert
      expect(result.message).toContain('permanentemente');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });

  describe('updateUserRole (Admin)', () => {
    it('should update user role successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, role: 'admin' };
      prisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUserRole({
        userId: 'user-123',
        role: 'admin',
      });

      // Assert
      expect(result.role).toBe('admin');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { role: 'admin' },
        select: expect.any(Object),
      });
    });

    it('should throw ValidationError when role is invalid', async () => {
      // Act & Assert
      await expect(
        userService.updateUserRole({ userId: 'user-123', role: 'superadmin' })
      ).rejects.toThrow('Rol inválido');
    });
  });
});
