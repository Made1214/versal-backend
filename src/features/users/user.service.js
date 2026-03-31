import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
} from "../../utils/errors.js";

// Validación de contraseña (compartida con auth.service.js)
function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password);
}

// Obtener perfil
async function getUserById({ userId, includeDeleted = false }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (!includeDeleted && user.isDeleted)) {
    throw new Error("Usuario no encontrado");
  }

  const { password: _password, ...userSafe } = user;
  return userSafe;
}

// Obtener usuario por email
async function getUserByEmail(email, includeDeleted = false) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (!includeDeleted && user.isDeleted)) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const { password: _password, ...userSafe } = user;
  return userSafe;
}

// Editar perfil
async function updateUser({ userId, data }) {
  if (data.password) {
    delete data.password;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      password: false,
      id: true,
      fullName: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      bio: true,
      subscriptionType: true,
      subscriptionEndDate: true,
      coins: true,
      isDeleted: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

// Cambiar contraseña
async function changePassword({ userId, oldPassword, newPassword }) {
  if (!isValidPassword(newPassword)) {
    throw new ValidationError("La nueva contraseña no cumple con los requisitos.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("Usuario no encontrado");

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw new ValidationError("Contraseña antigua incorrecta");

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });

  return { message: "Contraseña actualizada correctamente" };
}

// Ver seguidores
async function getFollowers({ userId }) {
  const followers = await prisma.follow.findMany({
    where: { followeeId: userId },
    select: {
      follower: { select: { id: true, username: true, profileImage: true } },
    },
  });
  return followers.map((f) => f.follower);
}

// Ver seguidos
async function getFollowing({ userId }) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      followee: { select: { id: true, username: true, profileImage: true } },
    },
  });
  return following.map((f) => f.followee);
}

// Seguir usuario
async function followUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes seguirte a ti mismo");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) throw new NotFoundError("Usuario no encontrado");

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId: currentUserId,
        followeeId: targetUserId,
      },
    },
  });

  if (existing) {
    throw new ConflictError("Ya sigues a este usuario");
  }

  await prisma.follow.create({
    data: { followerId: currentUserId, followeeId: targetUserId },
  });
  return { success: true, message: "Usuario seguido correctamente" };
}

// Dejar de seguir
async function unfollowUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes dejar de seguirte a ti mismo");
  }

  await prisma.follow.deleteMany({
    where: { followerId: currentUserId, followeeId: targetUserId },
  });

  return {
    success: true,
    message: "Dejaste de seguir al usuario correctamente",
  };
}

// Bloquear usuario
async function blockUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes bloquearte a ti mismo");
  }

  const existing = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    },
  });

  if (existing) {
    throw new ConflictError("Ya has bloqueado a este usuario");
  }

  await prisma.block.create({
    data: { blockerId: currentUserId, blockedId: targetUserId },
  });
  return { success: true, message: "Usuario bloqueado correctamente" };
}

// Desbloquear usuario
async function unblockUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes desbloquearte a ti mismo");
  }

  await prisma.block.deleteMany({
    where: { blockerId: currentUserId, blockedId: targetUserId },
  });

  return { success: true, message: "Usuario desbloqueado correctamente" };
}

// Obtener bloqueados
async function getBlockedUsers({ userId }) {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blocked: { select: { id: true, username: true, email: true } } },
  });
  return blocks.map((bl) => bl.blocked);
}

// ADMIN
async function getAllUsers({ includeDeleted = false } = {}) {
  const where = includeDeleted ? {} : { isDeleted: false };
  const users = await prisma.user.findMany({
    where,
    select: {
      password: false,
      id: true,
      fullName: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      bio: true,
      subscriptionType: true,
      subscriptionEndDate: true,
      coins: true,
      isDeleted: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
}

async function deleteUser({ userId, hardDelete = false }) {
  if (hardDelete) {
    await prisma.user.delete({ where: { id: userId } });
    return { message: "Usuario eliminado permanentemente" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return { message: "Usuario desactivado (soft delete) correctamente" };
}

async function updateUserRole({ userId, role }) {
  if (!["user", "admin"].includes(role)) {
    throw new ValidationError("Rol inválido");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      password: false,
      id: true,
      fullName: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      bio: true,
      subscriptionType: true,
      subscriptionEndDate: true,
      coins: true,
      isDeleted: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

export {
  isValidPassword,
  getUserByEmail,
  getUserById,
  updateUser,
  changePassword,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
