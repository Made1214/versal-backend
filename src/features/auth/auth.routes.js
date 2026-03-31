import * as authController from "./auth.controller.js";
import authRateLimitPlugin from "../../plugins/authRateLimit.plugin.js";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  meSchema,
} from "./auth.schema.js";

async function authRoutes(fastify) {
  // Registrar rate limiting específico para auth
  await fastify.register(authRateLimitPlugin);

  fastify.post(
    "/auth/register",
    { schema: registerSchema },
    authController.register,
  );
  fastify.post("/auth/login", { schema: loginSchema }, authController.login);
  fastify.post(
    "/auth/forgot-password",
    { schema: forgotPasswordSchema },
    authController.forgotPassword,
  );
  fastify.post(
    "/auth/reset-password",
    { schema: resetPasswordSchema },
    authController.resetPassword,
  );
  fastify.post(
    "/auth/refresh",
    { schema: refreshSchema },
    authController.refreshToken,
  );
  fastify.post("/auth/logout", { schema: logoutSchema }, authController.logout);

  fastify.get(
    "/auth/oauth/google/callback",
    { schema: { response: { 200: { type: 'object' } } } },
    authController.oauthGoogleCallback,
  );

  fastify.get(
    "/auth/me",
    {
      schema: meSchema,
      preHandler: [fastify.authenticate],
    },
    authController.me,
  );
}

export default authRoutes;
