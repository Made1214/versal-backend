import { userBase, authHeaders, messageResponse } from "../../schemas/shared.schema.js";

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: userBase,
        accessToken: { type: "string" },
      },
    },
  },
};

const registerSchema = {
  body: {
    type: "object",
    required: ["email", "password", "username", "fullName"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      username: { type: "string", minLength: 3 },
      fullName: { type: "string", minLength: 3 },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        user: userBase,
        accessToken: { type: "string" },
      },
    },
  },
};

const refreshSchema = {
  response: {
    200: { type: "object", properties: { accessToken: { type: "string" } } },
  },
};

const forgotPasswordSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
  },
  response: {
    200: messageResponse,
  },
};

const resetPasswordSchema = {
  body: {
    type: "object",
    required: ["email", "token", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      token: { type: "string" },
      newPassword: { type: "string", minLength: 8 },
    },
  },
  response: {
    200: messageResponse,
  },
};

const meSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        user: userBase,
      },
    },
  },
};

const logoutSchema = {
  response: {
    200: messageResponse,
  },
};

export {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  meSchema,
};
