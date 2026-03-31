# 📚 Contexto del Proyecto - Versal Backend

> Última actualización: 31/03/2026  
> **Para estado de tareas y progreso, ver `docs/ai/ESTADO.md`**

---

## 0. Propósito

Este documento es una guía de referencia arquitectónica para el backend. Contiene:
- Stack objetivo y estado actual
- Arquitectura y decisiones de diseño
- Patrones y convenciones
- Información de migración futura

**Para ver tareas pendientes, progreso y criterios de aceptación, consultar `docs/ai/ESTADO.md`**

---

## 1. Stack Objetivo (Versión Final Deseada)

- **Backend**: Fastify
- **ORM**: Prisma
- **Base de datos principal**: PostgreSQL
- **Base de datos de chat**: MongoDB (mensajería en tiempo real)
- **Autenticación**: JWT + Cookies `httpOnly` (refresh tokens + access tokens)
- **Frontend**: Next.js (repositorio separado)
- **Cliente de datos**: TanStack Query (React Query)
- **Pagos**: Stripe (mantener integración existente)

---

## 2. Estado Actual

- **Backend**: Node.js con Fastify + Prisma (PostgreSQL)
- **DB**: PostgreSQL para todo (usuarios, historias, capítulos, etc.)
- **Modelo de datos**: Modular con Prisma ORM
- **Tests**: Vitest configurado, 83 tests pasando ✅
- **Estructura**: Modular 1:1 (module por feature) - Bien organizado

---

## 3. Arquitectura General

### Patrón de Capas

```
Rutas (Fastify)
    ↓
Controladores (validación de request + respuesta)
    ↓
Servicios (lógica de negocio)
    ↓
Prisma ORM (Data Access)
    ↓
PostgreSQL (Base de datos)
```

### Estructura de Carpetas

```
src/
  config/
    index.js          ← ✅ Configuración centralizada + validación de env vars
    prisma.js         ← ✅ Cliente de Prisma
    logger.js         ← ✅ Configuración de Pino
  middlewares/
    errorHandler.js   ← ✅ Error handler global
    isAuthenticated.js ← ✅ Middleware de autenticación
    isOwner.js        ← ✅ Middleware de ownership
    isAdmin.js        ← ✅ Middleware de admin
  utils/
    errors.js         ← ✅ AppError, NotFoundError, ValidationError, etc.
    validate.js       ← ✅ Validación de datos
  plugins/
    auth.plugin.js    ← ✅ Plugin de auth
    rateLimit.plugin.js ← ✅ Plugin de rate limiting
    authRateLimit.plugin.js ← ✅ Plugin de rate limiting para auth
    helmet.plugin.js  ← ✅ Plugin de helmet
    cors.plugin.js    ← ✅ Plugin de CORS
  features/
    auth/
      auth.controller.js ← ✅ Sin try/catch
      auth.service.js ← ✅ Migrado a `throw`
      auth.routes.js
      auth.schema.js
    users/
      user.controller.js ← ✅ Sin try/catch
      user.service.js ← ✅ Migrado a `throw`
      user.routes.js
      user.schema.js
    stories/
      story.controller.js ← ✅ Sin try/catch
      story.service.js ← ✅ Migrado a Prisma + `throw` + paginación
      story.routes.js
      story.schema.js
    chapters/
      chapter.service.js ← ✅ Migrado a Prisma + `throw`
    interactions/
      interaction.service.js ← ✅ Migrado a Prisma + `throw`
    favorites/
      favorite.service.js ← ✅ Migrado a Prisma + `throw`
    reports/
      report.service.js ← ✅ Migrado a Prisma + `throw`
    transactions/
      transaction.service.js ← ✅ Migrado a Prisma + `throw`
    donations/
      donation.service.js ← ✅ Migrado a Prisma + `throw`
  __tests__/
    auth/
      auth.service.test.js ← ✅ Pasando
      auth.integration.test.js ← ✅ Pasando
    (otros tests) ← ✅ 83 tests pasando
```

---

## 4. Patrones y Convenciones

### Manejo de Errores

**Clases de Error Disponibles** (`src/utils/errors.js`):
- `AppError(message, statusCode)` - Base para todos los errores
- `NotFoundError(message)` - 404
- `ValidationError(message)` - 400
- `ForbiddenError(message)` - 403
- `UnauthorizedError(message)` - 401
- `ConflictError(message)` - 409

**Uso en Services**:
```javascript
import { ValidationError, NotFoundError } from "../../utils/errors.js";

async function getStory(storyId) {
  if (!storyId) {
    throw new ValidationError("Story ID is required");
  }
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) {
    throw new NotFoundError("Story not found");
  }
  return story;
}
```

**Controllers sin try/catch**:
```javascript
async function getStory(request, reply) {
  const story = await storyService.getStory(request.params.storyId);
  return reply.send({ story });
}
```

El error handler global (`src/middlewares/errorHandler.js`) captura todos los errores automáticamente.

### Middlewares Reutilizables

**Autenticación**:
```javascript
// En routes
fastify.post("/users/profile", 
  { preHandler: [fastify.authenticate] },
  getProfile
);
```

**Ownership**:
```javascript
// En routes
fastify.delete("/stories/:storyId",
  { preHandler: [fastify.authenticate, fastify.isOwner] },
  deleteStory
);
```

**Admin**:
```javascript
// En routes
fastify.get("/admin/users",
  { preHandler: [fastify.authenticate, fastify.isAdmin] },
  getAllUsers
);
```

### Logging

**En Controllers/Routes**:
```javascript
request.log.info("User created", { userId: user.id });
request.log.error("Error creating user", { error: err.message });
```

**NO usar**:
```javascript
console.log("..."); // ❌ Prohibido
console.error("..."); // ❌ Prohibido
```

---

## 5. Paginación

**Patrón en getAllStories**:
```javascript
async function getAllStories(filters = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: queryConditions,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.story.count({ where: queryConditions })
  ]);

  return {
    stories: stories.map(formatStory),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

---

## 6. Rate Limiting

**Global** (100 req/min):
```javascript
// src/plugins/rateLimit.plugin.js
```

**Para Auth** (5 intentos/15 min):
```javascript
// src/plugins/authRateLimit.plugin.js
// Registrado en src/features/auth/auth.routes.js
```

---

## 7. Health Check

**Endpoint**: `GET /health`

**Respuesta exitosa** (200):
```json
{
  "status": "ok",
  "timestamp": "2026-03-31T10:30:45.123Z",
  "uptime": 3600.5,
  "database": "connected"
}
```

**Respuesta error** (503):
```json
{
  "status": "error",
  "timestamp": "2026-03-31T10:30:45.123Z",
  "database": "disconnected",
  "error": "Connection refused"
}
```

---

## 8. Autenticación y Autorización

- **Login**: Token JWT corto (15m), refresh token httpOnly (30d)
- **Almacenamiento**: Refresh tokens en DB (Postgres) con relación a usuario
- **Cookies**: Secure y SameSite según entorno
- **Middlewares**:
  - `authenticate` (jwt verification)
  - `isAdmin` (verifica rol admin)
  - `isOwner` (verifica ownership del recurso)

---

## 9. Validación

**Email**:
```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Schemas JSON Schema** en cada módulo:
```javascript
export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 }
    }
  }
};
```

---

## 10. Configuración

**Variables de entorno requeridas**:
- `JWT_SECRET` (mínimo 32 caracteres)
- `DATABASE_URL` (PostgreSQL)
- `PORT` (default: 3000)
- `NODE_ENV` (development, production, test)

**Variables opcionales**:
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` (ambas o ninguna)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CORS_ORIGINS` (default: localhost)

**Validación**: Se ejecuta al arrancar en `src/config/index.js`

---

## 11. Comandos Útiles

```bash
# Desarrollo
pnpm dev                 # Iniciar servidor
pnpm test               # Ejecutar tests
pnpm test:watch         # Tests en modo watch

# Prisma
pnpm prisma migrate dev # Crear migración
pnpm prisma studio     # Abrir Prisma Studio

# Limpieza
pnpm remove jsonwebtoken  # Eliminar dependencia no usada
```

---

## 12. Próximos Pasos (Priorización)

### 🔴 Fase 1 - Críticos (COMPLETADA ✅)

- ✅ Error handler global + clases de error personalizadas
- ✅ Validación de env vars al arrancar
- ✅ Middlewares reutilizables (isAdmin, isOwner, isAuthenticated)
- ✅ Mejoras de seguridad (CORS, helmet, rate limit)
- ✅ Configuración centralizada
- ✅ app.js actualizado
- ✅ Todos los services migrados a Prisma + `throw`
- ✅ Todos los controllers sin try/catch
- ✅ Paginación en getAllStories
- ✅ Rate limiting específico para auth
- ✅ Health check endpoint

### 🟡 Fase 2 - Importantes (SIGUIENTE)

1. Ejecutar `pnpm remove jsonwebtoken`
2. Eliminar `src/plugins/stripe.js` (vacío)
3. Eliminar schemas no usados
4. Migrar Auth a ESM (si aún no está)
5. Separar story.model.js en 3 modelos
6. Extraer lógica de upload a util reutilizable
7. Transacciones de Prisma para operaciones críticas
8. Limpieza de archivos huérfanos
9. Schemas compartidos con `$ref`
10. Auto-loader de rutas

### 🟢 Fase 3 - Nice to Have (DESPUÉS)

1. Repository pattern
2. Tests unitarios y de integración completos
3. Docker setup
4. Inyección de dependencias
5. Migrar followers/following a colección separada

---

## 13. Documentación Relacionada

- **ESTADO.md** - Estado de tareas, progreso y criterios de aceptación (CONSULTAR PRIMERO)
- **QUICK_START.md** - Resumen de 1 página para agentes IA
- **Context.md** - Este archivo (referencia arquitectónica)

---

**Para ver tareas pendientes y progreso, consultar `docs/ai/ESTADO.md`**  
**Última actualización**: 31/03/2026
