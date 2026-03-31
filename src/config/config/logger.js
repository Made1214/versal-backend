const config = require('./index');

/**
 * Configuración del logger de Fastify (Pino)
 * Reemplaza todos los console.log de la aplicación
 */

const loggerConfig = {
  level: config.IS_PRODUCTION ? 'info' : 'debug',
  
  // En desarrollo, usar formato pretty para mejor legibilidad
  ...(config.IS_DEVELOPMENT && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  
  // En producción, usar formato JSON estructurado
  ...(config.IS_PRODUCTION && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  }),
  
  // Serializers personalizados para objetos sensibles
  serializers: {
    req: (request) => ({
      method: request.method,
      url: request.url,
      headers: {
        ...request.headers,
        // No loguear headers sensibles
        authorization: request.headers.authorization ? '[REDACTED]' : undefined,
        cookie: request.headers.cookie ? '[REDACTED]' : undefined,
      },
    }),
    res: (reply) => ({
      statusCode: reply.statusCode,
    }),
    err: (error) => ({
      type: error.constructor.name,
      message: error.message,
      stack: config.IS_DEVELOPMENT ? error.stack : undefined,
    }),
  },
};

module.exports = loggerConfig;