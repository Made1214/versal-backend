/**
 * User Repository - Acceso a datos para User
 * Los services usan este módulo para queries; ellos manejan la lógica de negocio.
 */

import prisma from "../config/prisma.js";

// Campos seguros (sin password)
const safeSelect = {
  password: false,
  id: true,
  fullName: true,
  username: true,
  email: true,
  profileImage: true,
  profileImagePublicId: true,
  role: true,
  bio: true,
  subscriptionType: true,
  subscriptionEndDate: true,
  coins: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function findById(id) {
  return await prisma.user.findUnique({ where: { id } });
}

export async function findByEmail(email) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function findByUsername(username) {
  return await prisma.user.findUnique({ where: { username } });
}

export async function findByOAuth(provider, oauthId) {
  return await prisma.user.findUnique({
    where: { oauthProvider_oauthId: { oauthProvider: provider, oauthId } },
  });
}

export async function create(data) {
  return await prisma.user.create({ data, select: safeSelect });
}

export async function update(id, data) {
  return await prisma.user.update({ where: { id }, data, select: safeSelect });
}

export async function softDelete(id) {
  return await prisma.user.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: safeSelect,
  });
}

export async function hardDelete(id) {
  return await prisma.user.delete({ where: { id } });
}

export async function findAll({ includeDeleted = false } = {}) {
  const where = includeDeleted ? {} : { isDeleted: false };
  return await prisma.user.findMany({ where, select: safeSelect });
}

// --- Follows ---

export async function findFollow(followerId, followeeId) {
  return await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId, followeeId } },
  });
}

export async function createFollow(followerId, followeeId) {
  return await prisma.follow.create({ data: { followerId, followeeId } });
}

export async function deleteFollow(followerId, followeeId) {
  return await prisma.follow.deleteMany({ where: { followerId, followeeId } });
}

export async function findFollowers(userId) {
  const rows = await prisma.follow.findMany({
    where: { followeeId: userId },
    select: {
      follower: { select: { id: true, username: true, profileImage: true } },
    },
  });
  return rows.map((r) => r.follower);
}

export async function findFollowing(userId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      followee: { select: { id: true, username: true, profileImage: true } },
    },
  });
  return rows.map((r) => r.followee);
}

// --- Blocks ---

export async function findBlock(blockerId, blockedId) {
  return await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
}

export async function createBlock(blockerId, blockedId) {
  return await prisma.block.create({ data: { blockerId, blockedId } });
}

export async function deleteBlock(blockerId, blockedId) {
  return await prisma.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function findBlockedUsers(userId) {
  const rows = await prisma.block.findMany({
    where: { blockerId: userId },
    select: {
      blocked: {
        select: { id: true, username: true, email: true, profileImage: true },
      },
    },
  });
  return rows.map((r) => r.blocked);
}
