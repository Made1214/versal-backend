import { ForbiddenError } from "../utils/errors.js";
import isAuthenticated from "./isAuthenticated.js";
import { isAdminRole } from "../utils/roles.js";

/**
 * Middleware para verificar que el usuario sea administrador
 * Primero verifica autenticación, luego verifica rol de admin
 */
async function isAdmin(request, reply) {
  // Primero verificar autenticación
  await isAuthenticated(request, reply);

  // Verificar que el usuario tenga rol de admin
  if (!request.user || !isAdminRole(request.user.role)) {
    throw new ForbiddenError(
      "Acceso denegado: se requieren permisos de administrador",
    );
  }
}

export default isAdmin;
