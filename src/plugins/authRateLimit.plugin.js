import rateLimit from '@fastify/rate-limit';

/**
 * Plugin de rate limiting específico para rutas de autenticación
 * Límites más estrictos que el rate limit global
 * - 5 intentos por 15 minutos por IP
 */
async function authRateLimitPlugin(fastify) {
  await fastify.register(rateLimit, {
    max: 5,
    timeWindow: '15 minutes',
    keyGenerator: (request) => request.ip,
    skipOnError: false,
    cache: 10000,
    allowList: [],
    redis: undefined,
    store: undefined,
  });
}

export default authRateLimitPlugin;
