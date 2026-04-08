import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  username: "testuser",
  fullName: "Test User",
  password: "$2b$10$hashedPassword123",
  role: "USER",
  bio: "Test bio",
  profileImage: "https://example.com/avatar.jpg",
  coins: 100,
  subscriptionType: "BASIC",
  subscriptionEndDate: null,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

// Mocks ANTES de los imports
vi.mock("../../repositories/user.repository.js", () => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOAuth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  hardDelete: vi.fn(),
  findAll: vi.fn(),
  findFollow: vi.fn(),
  createFollow: vi.fn(),
  deleteFollow: vi.fn(),
  findFollowers: vi.fn(),
  findFollowing: vi.fn(),
  findBlock: vi.fn(),
  createBlock: vi.fn(),
  deleteBlock: vi.fn(),
  findBlockedUsers: vi.fn(),
}));
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$10$hashedPassword123"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

import * as userService from "../../features/users/user.service.js";
import * as userRepo from "../../repositories/user.repository.js";
import bcrypt from "bcrypt";

describe("User Service", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getUserById", () => {
    it("retorna usuario sin password", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const result = await userService.getUserById({ userId: "user-123" });
      expect(result.id).toBe("user-123");
      expect(result.password).toBeUndefined();
    });

    it("lanza error si no existe", async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(
        userService.getUserById({ userId: "no-existe" }),
      ).rejects.toThrow("Usuario no encontrado");
    });

    it("lanza error si está eliminado y includeDeleted=false", async () => {
      userRepo.findById.mockResolvedValue({ ...mockUser, isDeleted: true });
      await expect(
        userService.getUserById({ userId: "user-123", includeDeleted: false }),
      ).rejects.toThrow("Usuario no encontrado");
    });

    it("retorna usuario eliminado si includeDeleted=true", async () => {
      userRepo.findById.mockResolvedValue({ ...mockUser, isDeleted: true });
      const result = await userService.getUserById({
        userId: "user-123",
        includeDeleted: true,
      });
      expect(result.id).toBe("user-123");
    });
  });

  describe("getUserByEmail", () => {
    it("retorna usuario por email", async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      const result = await userService.getUserByEmail("test@example.com");
      expect(result.email).toBe("test@example.com");
      expect(result.password).toBeUndefined();
    });

    it("retorna null si no existe", async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      const result = await userService.getUserByEmail("no@existe.com");
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("actualiza usuario correctamente", async () => {
      const updated = { ...mockUser, fullName: "Nuevo Nombre" };
      userRepo.update.mockResolvedValue(updated);
      const result = await userService.updateUser({
        userId: "user-123",
        data: { fullName: "Nuevo Nombre" },
      });
      expect(result.fullName).toBe("Nuevo Nombre");
    });

    it("no permite actualizar password por este método", async () => {
      userRepo.update.mockResolvedValue(mockUser);
      await userService.updateUser({
        userId: "user-123",
        data: { fullName: "Test", password: "hack" },
      });
      const callData = userRepo.update.mock.calls[0][1];
      expect(callData.password).toBeUndefined();
    });
  });

  describe("changePassword", () => {
    it("cambia contraseña correctamente", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("$2b$10$newHash");
      userRepo.update.mockResolvedValue(mockUser);
      const result = await userService.changePassword({
        userId: "user-123",
        oldPassword: "OldPass1!",
        newPassword: "NewPass1!",
      });
      expect(result.message).toContain("actualizada");
    });

    it("lanza error si contraseña nueva es débil", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      await expect(
        userService.changePassword({
          userId: "user-123",
          oldPassword: "OldPass1!",
          newPassword: "weak",
        }),
      ).rejects.toThrow("requisitos");
    });

    it("lanza error si contraseña antigua es incorrecta", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(
        userService.changePassword({
          userId: "user-123",
          oldPassword: "Wrong1!",
          newPassword: "NewPass1!",
        }),
      ).rejects.toThrow("incorrecta");
    });
  });

  describe("setPassword", () => {
    it("actualiza contraseña con hash", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue("$2b$10$newHash");
      userRepo.update.mockResolvedValue(mockUser);

      const result = await userService.setPassword({
        userId: "user-123",
        newPassword: "NewPass1!",
      });

      expect(userRepo.update).toHaveBeenCalledWith("user-123", {
        password: "$2b$10$newHash",
      });
      expect(result.message).toContain("actualizada");
    });

    it("lanza error si usuario no existe", async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        userService.setPassword({
          userId: "no-existe",
          newPassword: "NewPass1!",
        }),
      ).rejects.toThrow("Usuario no encontrado");
    });
  });

  describe("followUser", () => {
    it("sigue usuario correctamente", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.findFollow.mockResolvedValue(null);
      userRepo.createFollow.mockResolvedValue({});
      const result = await userService.followUser({
        currentUserId: "u1",
        targetUserId: "u2",
      });
      expect(result.success).toBe(true);
    });

    it("lanza error si intenta seguirse a sí mismo", async () => {
      await expect(
        userService.followUser({ currentUserId: "u1", targetUserId: "u1" }),
      ).rejects.toThrow("ti mismo");
    });

    it("lanza error si ya sigue al usuario", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.findFollow.mockResolvedValue({
        followerId: "u1",
        followeeId: "u2",
      });
      await expect(
        userService.followUser({ currentUserId: "u1", targetUserId: "u2" }),
      ).rejects.toThrow("Ya sigues");
    });

    it("lanza error si el usuario objetivo no existe", async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(
        userService.followUser({
          currentUserId: "u1",
          targetUserId: "no-existe",
        }),
      ).rejects.toThrow("no encontrado");
    });
  });

  describe("unfollowUser", () => {
    it("deja de seguir correctamente", async () => {
      userRepo.deleteFollow.mockResolvedValue({});
      const result = await userService.unfollowUser({
        currentUserId: "u1",
        targetUserId: "u2",
      });
      expect(result.success).toBe(true);
    });

    it("lanza error si intenta dejar de seguirse a sí mismo", async () => {
      await expect(
        userService.unfollowUser({ currentUserId: "u1", targetUserId: "u1" }),
      ).rejects.toThrow("ti mismo");
    });
  });

  describe("blockUser", () => {
    it("bloquea usuario correctamente", async () => {
      userRepo.findBlock.mockResolvedValue(null);
      userRepo.createBlock.mockResolvedValue({});
      const result = await userService.blockUser({
        currentUserId: "u1",
        targetUserId: "u2",
      });
      expect(result.success).toBe(true);
    });

    it("lanza error si intenta bloquearse a sí mismo", async () => {
      await expect(
        userService.blockUser({ currentUserId: "u1", targetUserId: "u1" }),
      ).rejects.toThrow("ti mismo");
    });

    it("lanza error si ya está bloqueado", async () => {
      userRepo.findBlock.mockResolvedValue({
        blockerId: "u1",
        blockedId: "u2",
      });
      await expect(
        userService.blockUser({ currentUserId: "u1", targetUserId: "u2" }),
      ).rejects.toThrow("Ya has bloqueado");
    });
  });

  describe("unblockUser", () => {
    it("desbloquea usuario correctamente", async () => {
      userRepo.deleteBlock.mockResolvedValue({});
      const result = await userService.unblockUser({
        currentUserId: "u1",
        targetUserId: "u2",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getFollowers", () => {
    it("retorna lista de seguidores", async () => {
      userRepo.findFollowers.mockResolvedValue([
        { id: "u2", username: "user2", profileImage: null },
      ]);
      const result = await userService.getFollowers({ userId: "u1" });
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe("user2");
    });
  });

  describe("getFollowing", () => {
    it("retorna lista de seguidos", async () => {
      userRepo.findFollowing.mockResolvedValue([
        { id: "u2", username: "user2", profileImage: null },
      ]);
      const result = await userService.getFollowing({ userId: "u1" });
      expect(result).toHaveLength(1);
    });
  });

  describe("getBlockedUsers", () => {
    it("retorna lista de bloqueados", async () => {
      userRepo.findBlockedUsers.mockResolvedValue([
        { id: "u2", username: "user2", email: "u2@test.com" },
      ]);
      const result = await userService.getBlockedUsers({ userId: "u1" });
      expect(result).toHaveLength(1);
    });
  });

  describe("getAllUsers", () => {
    it("retorna todos los usuarios activos por defecto", async () => {
      userRepo.findAll.mockResolvedValue([mockUser]);
      const result = await userService.getAllUsers();
      expect(userRepo.findAll).toHaveBeenCalledWith({ includeDeleted: false });
      expect(result).toHaveLength(1);
    });

    it("incluye eliminados si se pide", async () => {
      userRepo.findAll.mockResolvedValue([mockUser]);
      await userService.getAllUsers({ includeDeleted: true });
      expect(userRepo.findAll).toHaveBeenCalledWith({ includeDeleted: true });
    });
  });

  describe("deleteUser", () => {
    it("hace soft delete por defecto", async () => {
      userRepo.softDelete.mockResolvedValue({});
      const result = await userService.deleteUser({ userId: "u1" });
      expect(result.message).toContain("soft delete");
      expect(userRepo.softDelete).toHaveBeenCalledWith("u1");
    });

    it("hace hard delete si se pide", async () => {
      userRepo.hardDelete.mockResolvedValue({});
      const result = await userService.deleteUser({
        userId: "u1",
        hardDelete: true,
      });
      expect(result.message).toContain("permanentemente");
      expect(userRepo.hardDelete).toHaveBeenCalledWith("u1");
    });
  });

  describe("updateUserRole", () => {
    it("actualiza rol correctamente", async () => {
      userRepo.update.mockResolvedValue({ ...mockUser, role: "ADMIN" });
      const result = await userService.updateUserRole({
        userId: "u1",
        role: "admin",
      });
      expect(userRepo.update).toHaveBeenCalledWith("u1", { role: "ADMIN" });
      expect(result.role).toBe("ADMIN");
    });

    it("acepta role en mayúsculas y lo persiste igual", async () => {
      userRepo.update.mockResolvedValue({ ...mockUser, role: "ADMIN" });
      await userService.updateUserRole({ userId: "u1", role: "ADMIN" });
      expect(userRepo.update).toHaveBeenCalledWith("u1", { role: "ADMIN" });
    });

    it("lanza error si rol es inválido", async () => {
      await expect(
        userService.updateUserRole({ userId: "u1", role: "superadmin" }),
      ).rejects.toThrow("Rol inválido");
    });
  });
});
