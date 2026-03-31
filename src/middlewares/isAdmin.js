import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import isAuthenticated from './isAuthenticated.js';

/**
 * Middleware para verificar que el usuario sea administrador
 * Primero verifica autenticación, luego verifica rol de admin
 */
async function isAdmin(request, reply) {
  // Primero verificar autenticación
  await isAuthenticated(request, reply);
  
  // Verificar que el usuario tenga rol de admin
  if (!request.user || request.user.role !== 'admin') {
    throw new ForbiddenError('Acceso denegado: se requieren permisos de administrador');
  }
}

export default isAdmin;
