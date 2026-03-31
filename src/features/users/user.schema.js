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
    role: { type: "string", enum: ["user", "admin"] },
  },
  additionalProperties: false,
};

export {
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  userBase,
  userIdParam,
};
