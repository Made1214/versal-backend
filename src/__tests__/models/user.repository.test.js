import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../config/prisma.js";
import * as userRepo from "../../repositories/user.repository.js";

vi.mock("../../config/prisma.js");

describe("User Repository", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("findById", () => {
    it("retorna usuario si existe", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", email: "a@b.com" });
      const result = await userRepo.findById("u1");
      expect(result).toEqual({ id: "u1", email: "a@b.com" });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
    });

    it("retorna null si no existe", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await userRepo.findById("no-existe");
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("retorna usuario por email", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", email: "a@b.com" });
      const result = await userRepo.findByEmail("a@b.com");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "a@b.com" } });
      expect(result.email).toBe("a@b.com");
    });
  });

  describe("create", () => {
    it("crea usuario y retorna campos seguros", async () => {
      const mockUser = { id: "u1", email: "a@b.com", fullName: "Test" };
      prisma.user.create.mockResolvedValue(mockUser);
      const result = await userRepo.create({ email: "a@b.com", fullName: "Test", password: "hash" });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("actualiza usuario", async () => {
      prisma.user.update.mockResolvedValue({ id: "u1", fullName: "Nuevo" });
      const result = await userRepo.update("u1", { fullName: "Nuevo" });
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "u1" } }));
      expect(result.fullName).toBe("Nuevo");
    });
  });

  describe("softDelete", () => {
    it("marca usuario como eliminado", async () => {
      prisma.user.update.mockResolvedValue({ id: "u1", isDeleted: true });
      const result = await userRepo.softDelete("u1");
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isDeleted: true }) })
      );
      expect(result.isDeleted).toBe(true);
    });
  });

  describe("findAll", () => {
    it("retorna usuarios activos por defecto", async () => {
      prisma.user.findMany.mockResolvedValue([{ id: "u1" }]);
      await userRepo.findAll();
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isDeleted: false } })
      );
    });

    it("incluye eliminados si se pide", async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await userRepo.findAll({ includeDeleted: true });
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });
  });

  describe("Follows", () => {
    it("findFollow busca relación de seguimiento", async () => {
      prisma.follow.findUnique.mockResolvedValue({ followerId: "u1", followeeId: "u2" });
      const result = await userRepo.findFollow("u1", "u2");
      expect(prisma.follow.findUnique).toHaveBeenCalledWith({
        where: { followerId_followeeId: { followerId: "u1", followeeId: "u2" } },
      });
      expect(result).toBeTruthy();
    });

    it("createFollow crea relación", async () => {
      prisma.follow.create.mockResolvedValue({ followerId: "u1", followeeId: "u2" });
      await userRepo.createFollow("u1", "u2");
      expect(prisma.follow.create).toHaveBeenCalledWith({ data: { followerId: "u1", followeeId: "u2" } });
    });

    it("deleteFollow elimina relación", async () => {
      prisma.follow.deleteMany.mockResolvedValue({ count: 1 });
      await userRepo.deleteFollow("u1", "u2");
      expect(prisma.follow.deleteMany).toHaveBeenCalledWith({ where: { followerId: "u1", followeeId: "u2" } });
    });

    it("findFollowers retorna lista de seguidores", async () => {
      prisma.follow.findMany.mockResolvedValue([
        { follower: { id: "u2", username: "user2", profileImage: null } },
      ]);
      const result = await userRepo.findFollowers("u1");
      expect(result).toEqual([{ id: "u2", username: "user2", profileImage: null }]);
    });
  });

  describe("Blocks", () => {
    it("findBlock busca bloqueo", async () => {
      prisma.block.findUnique.mockResolvedValue({ blockerId: "u1", blockedId: "u2" });
      const result = await userRepo.findBlock("u1", "u2");
      expect(result).toBeTruthy();
    });

    it("createBlock crea bloqueo", async () => {
      prisma.block.create.mockResolvedValue({ blockerId: "u1", blockedId: "u2" });
      await userRepo.createBlock("u1", "u2");
      expect(prisma.block.create).toHaveBeenCalledWith({ data: { blockerId: "u1", blockedId: "u2" } });
    });

    it("findBlockedUsers retorna lista de bloqueados", async () => {
      prisma.block.findMany.mockResolvedValue([
        { blocked: { id: "u2", username: "user2", email: "u2@test.com" } },
      ]);
      const result = await userRepo.findBlockedUsers("u1");
      expect(result).toEqual([{ id: "u2", username: "user2", email: "u2@test.com" }]);
    });
  });
});
