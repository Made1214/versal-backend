import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { getUserById } from "../features/users/user.service.js";
import { normalizeRole } from "../utils/roles.js";

/**
 * Middleware de autenticación para Fastify
 * Verifica que el usuario esté autenticado mediante JWT
 */
async function isAuthenticated(request, _reply) {
  await request.jwtVerify();

  if (!request.user?.userId) {
    throw new UnauthorizedError("Token inválido o usuario no encontrado");
  }

  let user;
  try {
    user = await getUserById({ userId: request.user.userId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError("Token inválido o usuario no encontrado");
    }
    throw error;
  }

  const normalizedRole = normalizeRole(user.role);
  if (!normalizedRole) {
    throw new UnauthorizedError("Usuario con rol inválido.");
  }

  request.user.role = normalizedRole;
}

export default isAuthenticated;
