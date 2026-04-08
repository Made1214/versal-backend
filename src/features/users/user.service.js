import bcrypt from "bcrypt";
import * as userRepo from "../../repositories/user.repository.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../utils/errors.js";
import { normalizeRole } from "../../utils/roles.js";

const PROFILE_UPDATABLE_FIELDS = new Set([
  "fullName",
  "username",
  "email",
  "bio",
  "profileImage",
  "profileImagePublicId",
]);

// Validación de contraseña
function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password);
}

// Validacion de email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Obtener perfil
async function getUserById({ userId, includeDeleted = false }) {
  const user = await userRepo.findById(userId);
  if (!user || (!includeDeleted && user.isDeleted)) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const userSafe = { ...user };
  delete userSafe.password;
  return userSafe;
}

// Obtener usuario por email
async function getUserByEmail(email, includeDeleted = false) {
  const user = await userRepo.findByEmail(email);
  if (!user || (!includeDeleted && user.isDeleted)) {
    return null;
  }

  const userSafe = { ...user };
  delete userSafe.password;
  return userSafe;
}

// Editar perfil
async function updateUser({ userId, data }) {
  const forbiddenFields = Object.keys(data).filter(
    (field) => !PROFILE_UPDATABLE_FIELDS.has(field),
  );

  if (forbiddenFields.length > 0) {
    throw new ValidationError(
      `Campos no permitidos en la actualización: ${forbiddenFields.join(", ")}`,
    );
  }

  if (data.email && !isValidEmail(data.email)) {
    throw new ValidationError("El email no es válido.");
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("No se enviaron campos válidos para actualizar.");
  }

  const updatedUser = await userRepo.update(userId, data);
  return updatedUser;
}

// Actualizar contraseña de forma segura.
async function setPassword({ userId, newPassword }) {
  if (!isValidPassword(newPassword)) {
    throw new ValidationError(
      "La nueva contraseña no cumple con los requisitos.",
    );
  }

  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError("Usuario no encontrado");

  const hash = await bcrypt.hash(newPassword, 10);
  await userRepo.update(userId, { password: hash });

  return { message: "Contraseña actualizada correctamente" };
}

// Cambiar contraseña
async function changePassword({ userId, oldPassword, newPassword }) {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError("Usuario no encontrado");

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw new ValidationError("Contraseña antigua incorrecta");

  return await setPassword({ userId, newPassword });
}

// Ver seguidores
async function getFollowers({ userId }) {
  return await userRepo.findFollowers(userId);
}

// Ver seguidos
async function getFollowing({ userId }) {
  return await userRepo.findFollowing(userId);
}

// Seguir usuario
async function followUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes seguirte a ti mismo");
  }

  const targetUser = await userRepo.findById(targetUserId);
  if (!targetUser) throw new NotFoundError("Usuario no encontrado");

  const existing = await userRepo.findFollow(currentUserId, targetUserId);
  if (existing) {
    throw new ConflictError("Ya sigues a este usuario");
  }

  await userRepo.createFollow(currentUserId, targetUserId);
  return { success: true, message: "Usuario seguido correctamente" };
}

// Dejar de seguir
async function unfollowUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes dejar de seguirte a ti mismo");
  }

  await userRepo.deleteFollow(currentUserId, targetUserId);

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

  const existing = await userRepo.findBlock(currentUserId, targetUserId);
  if (existing) {
    throw new ConflictError("Ya has bloqueado a este usuario");
  }

  await userRepo.createBlock(currentUserId, targetUserId);
  return { success: true, message: "Usuario bloqueado correctamente" };
}

// Desbloquear usuario
async function unblockUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new ValidationError("No puedes desbloquearte a ti mismo");
  }

  await userRepo.deleteBlock(currentUserId, targetUserId);

  return { success: true, message: "Usuario desbloqueado correctamente" };
}

// Obtener bloqueados
async function getBlockedUsers({ userId }) {
  return await userRepo.findBlockedUsers(userId);
}

// ADMIN
async function getAllUsers({ includeDeleted = false } = {}) {
  return await userRepo.findAll({ includeDeleted });
}

async function deleteUser({ userId, hardDelete = false }) {
  if (hardDelete) {
    await userRepo.hardDelete(userId);
    return { message: "Usuario eliminado permanentemente" };
  }

  await userRepo.softDelete(userId);
  return { message: "Usuario desactivado (soft delete) correctamente" };
}

async function updateUserRole({ userId, role }) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    throw new ValidationError("Rol inválido");
  }

  return await userRepo.update(userId, { role: normalizedRole });
}

export {
  isValidPassword,
  isValidEmail,
  getUserByEmail,
  getUserById,
  updateUser,
  setPassword,
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
