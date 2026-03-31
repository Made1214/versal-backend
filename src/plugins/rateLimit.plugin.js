import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';

/**
 * Plugin de rate limiting para Fastify
 * Configura límites diferentes para endpoints públicos y privados
 */
async function rateLimitPlugin(fastify) {
  // Rate limit para endpoints públicos (login, registro, etc.)
  fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (request, context) => ({
      error: 'RateLimitError',
      message: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.',
      retryAfter: context.after,
    }),
  });

  // Rate limit más estricto para endpoints de autenticación
  fastify.register(fastifyRateLimit, {
    name: 'auth-rate-limit',
    max: 10,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (request, context) => ({
      error: 'RateLimitError',
      message: 'Demasiados intentos de autenticación. Inténtalo de nuevo más tarde.',
      retryAfter: context.after,
    }),
  });

  // Rate limit para endpoints privados
  fastify.register(fastifyRateLimit, {
    name: 'private-rate-limit',
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (request, context) => ({
      error: 'RateLimitError',
      message: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.',
      retryAfter: context.after,
    }),
  });
}

export default fp(rateLimitPlugin);