import { userBase, userIdParam } from "../../schemas/shared.schema.js";

const updateProfileSchema = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    bio: { type: "string" },
    profileImage: { type: "string", format: "uri" },
  },
  additionalProperties: false,
};

const changePasswordSchema = {
  type: "object",
  required: ["oldPassword", "newPassword"],
  properties: {
    oldPassword: { type: "string", minLength: 8 },
    newPassword: { type: "string", minLength: 8 },
  },
  additionalProperties: false,
};

const updateRoleSchema = {
  type: "object",
  required: ["role"],
  properties: {
    role: { type: "string", enum: ["user", "admin", "USER", "ADMIN"] },
  },
  additionalProperties: false,
};

const userArrayResponse = {
  type: "array",
  items: userBase,
};

const messageResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  additionalProperties: true,
};

const actionResponse = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
  },
  additionalProperties: true,
};

const getCurrentUserSchema = {
  response: {
    200: userBase,
  },
};

const updateProfileRouteSchema = {
  consumes: ["multipart/form-data"],
  response: {
    200: userBase,
  },
};

const getBlockedUsersSchema = {
  response: {
    200: userArrayResponse,
  },
};

const userRelationActionSchema = {
  params: userIdParam,
  response: {
    200: actionResponse,
  },
};

const getUserCollectionSchema = {
  params: userIdParam,
  response: {
    200: userArrayResponse,
  },
};

const getAllUsersSchema = {
  response: {
    200: userArrayResponse,
  },
};

const deleteUserSchema = {
  params: userIdParam,
  response: {
    200: messageResponse,
  },
};

const updateUserRoleRouteSchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string" },
    },
  },
  body: updateRoleSchema,
  response: {
    200: userBase,
  },
};

export {
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  getCurrentUserSchema,
  updateProfileRouteSchema,
  getBlockedUsersSchema,
  userRelationActionSchema,
  getUserCollectionSchema,
  getAllUsersSchema,
  deleteUserSchema,
  updateUserRoleRouteSchema,
  messageResponse,
  actionResponse,
  userBase,
  userIdParam,
};
