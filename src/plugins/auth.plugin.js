import fp from 'fastify-plugin';
import isAuthenticated from '../middlewares/isAuthenticated.js';

/**
 * Plugin de autenticación para Fastify
 * Decorador 'authenticate' que verifica JWT y usuario activo
 */
async function authPlugin(fastify) {
  // Decorador para verificar autenticación
  fastify.decorate('authenticate', isAuthenticated);
}

export default fp(authPlugin);