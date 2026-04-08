import * as userService from "./user.service.js";
import { deleteImage, uploadAvatar } from "../../utils/cloudinary.js";

// Obtener usuario actual
async function getCurrentUser(req, reply) {
  const user = await userService.getUserById({ userId: req.user.userId });
  reply.send(user);
}

// Obtener perfil de usuario por ID
async function getUserProfileById(req, reply) {
  const { id } = req.params;
  const user = await userService.getUserById({ userId: id });

  const publicUser = { ...user };
  delete publicUser.password;
  delete publicUser.email;
  delete publicUser.subscription;
  delete publicUser.totalCoinsReceived;

  reply.send(publicUser);
}

// Actualizar usuario
async function updateProfile(req, reply) {
  const data = {};
  const user = await userService.getUserById({ userId: req.user.userId });
  const previousProfileImagePublicId = user.profileImagePublicId;

  const parts = req.parts();
  for await (const part of parts) {
    if (part.file) {
      const uploadResult = await uploadAvatar(part);
      data.profileImage = uploadResult.url;
      data.profileImagePublicId = uploadResult.publicId;
    } else {
      data[part.fieldname] = part.value;
    }
  }

  const updatedUser = await userService.updateUser({
    userId: req.user.userId,
    data: data,
  });

  // Eliminamos la imagen anterior solo después de persistir correctamente la nueva referencia.
  if (
    data.profileImagePublicId &&
    previousProfileImagePublicId &&
    previousProfileImagePublicId !== data.profileImagePublicId
  ) {
    await deleteImage(previousProfileImagePublicId, "image");
  }

  reply.send(updatedUser);
}

// Cambiar contraseña
async function changePassword(req, reply) {
  const { oldPassword, newPassword } = req.body;
  const result = await userService.changePassword({
    userId: req.user.userId,
    oldPassword,
    newPassword,
  });

  reply.send({ message: result.message });
}

// Seguir usuario
async function followUser(req, reply) {
  const result = await userService.followUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Dejar de seguir usuario
async function unfollowUser(req, reply) {
  const result = await userService.unfollowUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Ver seguidores
async function getFollowers(req, reply) {
  const userId = req.params.id || req.user.userId;
  const followers = await userService.getFollowers({ userId });
  reply.send(followers);
}

// Ver seguidos
async function getFollowing(req, reply) {
  const userId = req.params.id || req.user.userId;
  const following = await userService.getFollowing({ userId });
  reply.send(following);
}

// Ver usuarios bloqueados
async function getBlockedUsers(req, reply) {
  const blockedUsers = await userService.getBlockedUsers({
    userId: req.user.userId,
  });
  reply.send(blockedUsers);
}

// Bloquear usuario
async function blockUser(req, reply) {
  const result = await userService.blockUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Desbloquear usuario
async function unblockUser(req, reply) {
  const result = await userService.unblockUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// ADMIN
async function getAllUsers(req, reply) {
  const users = await userService.getAllUsers();
  reply.send(users);
}

// Borrar usuario
async function deleteUser(req, reply) {
  const { id } = req.params;
  const result = await userService.deleteUser({ userId: id });
  reply.send(result);
}

// Actualizar rol de usuario
async function updateUserRole(req, reply) {
  const { userId } = req.params;
  const { role } = req.body;

  const result = await userService.updateUserRole({ userId, role });
  reply.send(result);
}

export {
  getCurrentUser,
  updateProfile,
  changePassword,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserProfileById,
};
