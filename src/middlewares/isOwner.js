import { ForbiddenError } from '../utils/errors.js';
import isAuthenticated from './isAuthenticated.js';

/**
 * Middleware para verificar que el usuario sea el propietario del recurso
 * Verifica que el userId del token coincida con el ID del recurso
 * 
 * Uso: Se espera que el ID del recurso esté en request.params.id o request.params.userId
 */
async function isOwner(request, reply) {
  // Primero verificar autenticación
  await isAuthenticated(request, reply);
  
  // Obtener el ID del recurso de los parámetros
  const resourceId = request.params.id || request.params.userId;
  
  // Verificar que el usuario autenticado sea el propietario
  if (!resourceId || request.user.userId !== resourceId) {
    throw new ForbiddenError('Acceso denegado: solo el propietario puede realizar esta acción');
  }
}

export default isOwner;
