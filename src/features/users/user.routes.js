import * as userController from "./user.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";
import {
  getCurrentUserSchema,
  updateProfileRouteSchema,
  changePasswordSchema,
  getBlockedUsersSchema,
  userRelationActionSchema,
  getUserCollectionSchema,
  getAllUsersSchema,
  deleteUserSchema,
  updateUserRoleRouteSchema,
  userIdParam,
  userBase,
} from "./user.schema.js";

async function userRoutes(fastify) {
  // Seguidores
  fastify.get(
    "/:id/followers",
    { schema: getUserCollectionSchema },
    userController.getFollowers,
  );

  //Seguidos
  fastify.get(
    "/:id/following",
    { schema: getUserCollectionSchema },
    userController.getFollowing,
  );

  // Rutas protegidas
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Perfil
    privateRoutes.get(
      "/me",
      { schema: getCurrentUserSchema },
      userController.getCurrentUser,
    );

    // Actualizar perfil
    privateRoutes.put(
      "/me",
      { schema: updateProfileRouteSchema },
      userController.updateProfile,
    );

    // Obtener perfil por ID
    privateRoutes.get(
      "/:id",
      {
        schema: {
          params: userIdParam,
          response: {
            200: userBase,
          },
        },
      },
      userController.getUserProfileById,
    );

    // Cambiar contraseña
    privateRoutes.put(
      "/me/password",
      {
        schema: {
          body: changePasswordSchema,
          response: {
            200: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
      userController.changePassword,
    );

    // Bloqueados
    privateRoutes.get(
      "/me/blocked",
      { schema: getBlockedUsersSchema },
      userController.getBlockedUsers,
    );

    // Interacciones con otros usuarios
    privateRoutes.post(
      "/:id/follow",
      { schema: userRelationActionSchema },
      userController.followUser,
    );

    privateRoutes.post(
      "/:id/unfollow",
      { schema: userRelationActionSchema },
      userController.unfollowUser,
    );

    privateRoutes.post(
      "/:id/block",
      { schema: userRelationActionSchema },
      userController.blockUser,
    );

    privateRoutes.post(
      "/:id/unblock",
      { schema: userRelationActionSchema },
      userController.unblockUser,
    );
  });

  // Admin
  fastify.register(async function (adminRoutes) {
    adminRoutes.addHook("onRequest", isAdmin);
    adminRoutes.get(
      "/all",
      { schema: getAllUsersSchema },
      userController.getAllUsers,
    );

    adminRoutes.delete(
      "/:id",
      { schema: deleteUserSchema },
      userController.deleteUser,
    );
    adminRoutes.put(
      "/:userId/role",
      { schema: updateUserRoleRouteSchema },
      userController.updateUserRole,
    );
  });
}

export default userRoutes;
