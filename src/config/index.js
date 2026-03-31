import envSchema from 'env-schema';

/**
 * Configuración centralizada con validación de variables de entorno
 * Se ejecuta al arrancar la aplicación para validar que todas las variables necesarias existan
 */

const schema = {
  type: 'object',
  required: [
    'JWT_SECRET',
    'DATABASE_URL',
  ],
  properties: {
    // Servidor
    PORT: {
      type: 'string',
      default: '3000',
    },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production', 'test'],
      default: 'development',
    },
    
    // JWT
    JWT_SECRET: {
      type: 'string',
      minLength: 32,
    },
    JWT_EXPIRES_IN: {
      type: 'string',
      default: '15m',
    },
    REFRESH_TOKEN_EXPIRES_IN: {
      type: 'string',
      default: '30d',
    },
    
    // Base de datos
    DATABASE_URL: {
      type: 'string',
    },
    

    CORS_ORIGINS: {
      type: 'string',
      default: 'http://localhost:8080,http://localhost:3000',
    },
    
    // OAuth Google
    GOOGLE_CLIENT_ID: {
      type: 'string',
      default: 'placeholder',
    },
    GOOGLE_CLIENT_SECRET: {
      type: 'string',
      default: 'placeholder',
    },
    GOOGLE_OAUTH_CALLBACK_URL: {
      type: 'string',
      default: 'http://localhost:3000/api/auth/oauth/google/callback',
    },
    
    // Stripe (opcional)
    STRIPE_SECRET_KEY: {
      type: 'string',
    },
    STRIPE_WEBHOOK_SECRET: {
      type: 'string',
    },
    
    // Seguridad
    RATE_LIMIT_MAX: {
      type: 'string',
      default: '100',
    },
    RATE_LIMIT_WINDOW: {
      type: 'string',
      default: '1 minute',
    },
  },
};

// Validar y exportar configuración
const config = envSchema({
  schema,
  dotenv: true,
});

// Procesar arrays desde strings
config.CORS_ORIGINS_ARRAY = config.CORS_ORIGINS.split(',').map(origin => origin.trim());
config.RATE_LIMIT_MAX_NUMBER = parseInt(config.RATE_LIMIT_MAX, 10);

// Configuraciones derivadas
config.IS_PRODUCTION = config.NODE_ENV === 'production';
config.IS_DEVELOPMENT = config.NODE_ENV === 'development';

// Validar que Stripe esté completamente configurado o no configurado
if ((config.STRIPE_SECRET_KEY && !config.STRIPE_WEBHOOK_SECRET) || 
    (!config.STRIPE_SECRET_KEY && config.STRIPE_WEBHOOK_SECRET)) {
  throw new Error('STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET deben estar ambas configuradas o ambas ausentes');
}

export default config;
