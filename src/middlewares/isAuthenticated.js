import { UnauthorizedError } from '../utils/errors.js';

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
      throw new UnauthorizedError('Token inválido o usuario no encontrado');
    }
  } catch (error) {
    // Si jwtVerify falla, lanzar error de autenticación
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Autenticación requerida');
  }
}

export default isAuthenticated;
