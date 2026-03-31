const fp = require('fastify-plugin');

/**
 * Plugin de rate limiting para Fastify
 * Configura límites diferentes para endpoints públicos y privados
 */
async function rateLimitPlugin(fastify) {
  // Rate limit para endpoints públicos (login, registro, etc.)
  fastify.register(require('@fastify/rate-limit'), {
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
  fastify.register(require('@fastify/rate-limit'), {
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
  fastify.register(require('@fastify/rate-limit'), {
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

module.exports = fp(rateLimitPlugin);