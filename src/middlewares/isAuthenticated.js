import { UnauthorizedError } from "../utils/errors.js";
import { getUserById } from "../features/users/user.service.js";
import { normalizeRole } from "../utils/roles.js";

/**
 * Middleware de autenticación para Fastify
 * Verifica que el usuario esté autenticado mediante JWT
 */
async function isAuthenticated(request, reply) {
  try {
    // Verificar el JWT token
    await request.jwtVerify();

    // El token es válido, request.user contiene el payload decodificado
    if (!request.user || !request.user.userId) {
      throw new UnauthorizedError("Token inválido o usuario no encontrado");
    }

    // Endurecer auth: comprobar que el usuario sigue activo.
    const user = await getUserById({ userId: request.user.userId });
    const normalizedRole = normalizeRole(user.role);

    if (!normalizedRole) {
      throw new UnauthorizedError("Usuario con rol inválido.");
    }

    request.user.role = normalizedRole;
  } catch (error) {
    // Si jwtVerify falla, lanzar error de autenticación
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Autenticación requerida");
  }
}

export default isAuthenticated;
