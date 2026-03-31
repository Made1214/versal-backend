// Versal/backend/app.js
const path = require('path');
const fastify = require('fastify')({ logger: true });

// Configuración centralizada (valida env vars al cargar)
const config = require('./src/config/index');

// Importar componentes de infraestructura
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');
const corsPlugin = require('./src/plugins/cors.plugin');
const helmetPlugin = require('./src/plugins/helmet.plugin');
const rateLimitPlugin = require('./src/plugins/rateLimit.plugin');
const authPlugin = require('./src/plugins/auth.plugin');

// Importar rutas
const storyRoutes = require('./src/features/stories/story.routes');
const userRoutes = require('./src/features/users/user.routes');
const transactionRoutes = require('./src/features/transactions/transaction.routes');
const interactionRoutes = require('./src/features/interactions/interaction.routes');
const chapterRoutes = require('./src/features/chapters/chapter.routes');
const favoriteRoutes = require('./src/features/favorites/favorite.routes');
const reportRoutes = require('./src/features/reports/report.routes');
const donationRoutes = require('./src/features/donations/donation.routes');
const authRoutes = require('./src/features/auth/auth.routes');

// Importar plugins de Fastify
const jwt = require('@fastify/jwt');
const fastifyMultipart = require('@fastify/multipart');
const fastifyStatic = require('@fastify/static');
const fastifyCookie = require('@fastify/cookie');
const fastifyRawBody = require('fastify-raw-body');

// Conectar a la base de datos
connectDB();

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
fastify.register(require('@fastify/oauth2'), {
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
});

// Cookies
fastify.register(fastifyCookie);

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

// Rutas de auth
fastify.register(authRoutes, { prefix: '/api' });

// Rutas de usuario
fastify.register(userRoutes, { prefix: '/api/users' });

// Rutas de las historias
fastify.register(storyRoutes, { prefix: '/api/stories' });

// Rutas de interacciones
fastify.register(interactionRoutes, { prefix: '/api/interactions' });

// Rutas de transacciones
fastify.register(transactionRoutes, { prefix: '/api' });

// Rutas de capítulos
fastify.register(chapterRoutes, { prefix: '/api' });

// Rutas de favoritos
fastify.register(favoriteRoutes, { prefix: '/api' });

// Rutas de reportes
fastify.register(reportRoutes, { prefix: '/api' });

// Rutas de donaciones
fastify.register(donationRoutes, { prefix: '/api' });

// ============================================
// INICIAR SERVIDOR
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: config.PORT }, (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`🚀 Server ejecutándose en ${address}`);
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
