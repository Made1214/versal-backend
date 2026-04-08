import { ForbiddenError } from "../utils/errors.js";
import isAuthenticated from "./isAuthenticated.js";

/**
 * Middleware para verificar que el usuario sea el propietario del recurso
 * Verifica que el userId del token coincida con el ID del recurso
 *
 * Uso: Se espera que el ID del recurso esté en request.params.id o request.params.userId.
 */
async function isOwner(request, reply) {
  // Primero verificar autenticación
  await isAuthenticated(request, reply);

  const ownerParam = request.routeOptions?.config?.ownerParam;
  const candidates = [ownerParam, "id", "userId"].filter(Boolean);
  const resourceId = candidates
    .map((key) => request.params?.[key])
    .find(Boolean);

  // Verificar que el usuario autenticado sea el propietario
  if (!resourceId || request.user.userId !== resourceId) {
    throw new ForbiddenError(
      "Acceso denegado: solo el propietario puede realizar esta acción",
    );
  }
}

export default isOwner;
