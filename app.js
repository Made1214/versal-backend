// Versal/backend/app.js
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fastifyLib from 'fastify';

const fastify = fastifyLib({ logger: true });

// Configuración centralizada (valida env vars al cargar)
import config from './src/config/index.js';

// Importar Prisma
import prisma from './src/config/prisma.js';

// Importar componentes de infraestructura
import errorHandler from './src/middlewares/errorHandler.js';
import corsPlugin from './src/plugins/cors.plugin.js';
import helmetPlugin from './src/plugins/helmet.plugin.js';
import rateLimitPlugin from './src/plugins/rateLimit.plugin.js';
import authPlugin from './src/plugins/auth.plugin.js';
import { loadRoutes } from './src/utils/routeLoader.js';

// Importar plugins de Fastify
import jwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyRawBody from 'fastify-raw-body';
import fastifyOAuth2 from '@fastify/oauth2';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// ============================================
// REGISTRAR PLUGINS DE SEGURIDAD Y UTILIDAD
// ============================================

// Error handler global (debe ser primero)
fastify.register(errorHandler);

// Plugins de seguridad
fastify.register(corsPlugin);
fastify.register(helmetPlugin);
fastify.register(rateLimitPlugin);

// JWT
fastify.register(jwt, { 
  secret: config.JWT_SECRET,
  sign: { expiresIn: config.JWT_EXPIRES_IN }
});

// Auth plugin (usa JWT)
fastify.register(authPlugin);

// Google OAuth2 
fastify.register(fastifyOAuth2, {
  name: 'googleOAuth2',
  scope: ['openid', 'email', 'profile'],
  credentials: {
    client: {
      id: config.GOOGLE_CLIENT_ID,
      secret: config.GOOGLE_CLIENT_SECRET
    },
    auth: {
      authorizeHost: 'https://accounts.google.com',
      authorizePath: '/o/oauth2/v2/auth',
      tokenHost: 'https://oauth2.googleapis.com',
      tokenPath: '/token'
    }
  },
  startRedirectPath: '/api/auth/oauth/google',
  callbackUri: config.GOOGLE_OAUTH_CALLBACK_URL,
});

// Multipart
fastify.register(fastifyMultipart);

// Static files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/'
});

// Raw body (para webhooks de Stripe)
fastify.register(fastifyRawBody, {
  field: 'rawBody',
  global: false,
  encoding: 'utf8'
});

// ============================================
// REGISTRAR RUTAS
// ============================================

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    // Verificar conexión a BD
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    };
  } catch (error) {
    reply.code(503);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    };
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const start = async () => {
  try {
    // Cargar rutas automáticamente desde src/features
    await loadRoutes(fastify, './src/features');

    await fastify.listen({ port: config.PORT }, (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`Server ejecutándose en ${address}`);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('SIGTERM recibido, cerrando servidor...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT recibido, cerrando servidor...');
  await fastify.close();
  process.exit(0);
});

start();
