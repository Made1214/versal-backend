import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import config from '../config/index.js';

/**
 * Plugin de CORS para Fastify
 * Configura CORS con orígenes específicos desde variables de entorno
 */
async function corsPlugin(fastify) {
  fastify.register(fastifyCors, {
    origin: config.CORS_ORIGINS_ARRAY,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 horas
  });
}

export default fp(corsPlugin);