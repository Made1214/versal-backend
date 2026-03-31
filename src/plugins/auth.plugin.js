const fp = require('fastify-plugin');
const isAuthenticated = require('../middlewares/isAuthenticated');

/**
 * Plugin de autenticación para Fastify
 * Decorador 'authenticate' que verifica JWT y usuario activo
 */
async function authPlugin(fastify) {
  // Decorador para verificar autenticación
  fastify.decorate('authenticate', isAuthenticated);
}

module.exports = fp(authPlugin);