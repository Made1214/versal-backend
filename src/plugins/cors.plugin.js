const fp = require('fastify-plugin');
const config = require('../config/index');

/**
 * Plugin de CORS para Fastify
 * Configura CORS con orígenes específicos desde variables de entorno
 */
async function corsPlugin(fastify) {
  fastify.register(require('@fastify/cors'), {
    origin: config.CORS_ORIGINS_ARRAY,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 horas
  });
}

module.exports = fp(corsPlugin);