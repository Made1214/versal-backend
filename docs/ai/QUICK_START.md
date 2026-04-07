# 🚀 Quick Start - Versal Backend

> **Para agentes IA**: Lee esto primero (5 min). Luego consulta ESTADO.md o Context.md según necesites.

---

## 📦 Stack

- **Backend**: Fastify (Node.js)
- **ORM**: Prisma
- **BD Principal**: PostgreSQL
- **Autenticación**: JWT + Cookies httpOnly
- **Módulos**: ESM (import/export)
- **Tests**: Vitest
- **Pagos**: Stripe

---

## 📁 Estructura de Carpetas

```
src/
  features/          ← Módulos por feature (auth, users, stories, etc.)
    auth/
      auth.controller.js
      auth.service.js
      auth.routes.js
      auth.schema.js
  config/            ← Configuración centralizada
    index.js         ← Validación de env vars
    prisma.js        ← Cliente de Prisma
  middlewares/       ← Middlewares reutilizables
    errorHandler.js  ← Captura TODOS los errores
    isAuthenticated.js
    isOwner.js
    isAdmin.js
  utils/
    errors.js        ← Clases de error personalizadas
    validate.js      ← Validación de datos
  plugins/           ← Plugins de Fastify
    cors.plugin.js
    helmet.plugin.js
    rateLimit.plugin.js
    authRateLimit.plugin.js
  __tests__/         ← Tests (Vitest)
```

---

## 🎯 Patrones Clave

### 1. Manejo de Errores

**Services lanzan errores** (no retornan `{ error }`):

```javascript
import { ValidationError, NotFoundError } from "../../utils/errors.js";

async function getUser(userId) {
  if (!userId) throw new ValidationError("User ID required");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");
  return user;
}
```

**Controllers sin try/catch** (error handler global captura todo):

```javascript
async function getUser(request, reply) {
  const user = await userService.getUser(request.params.userId);
  return reply.send({ user });
}
```

**Error handler global** (`src/middlewares/errorHandler.js`):

- Captura todos los errores automáticamente
- Formatea respuestas consistentes
- Maneja errores de Prisma, JWT, validación, etc.

### 2. Logging

**Usar logger de Fastify** (no console.log):

```javascript
// ✅ Correcto
request.log.info("User created", { userId: user.id });
request.log.error("Error creating user", { error: err.message });

// ❌ Prohibido
console.log("User created");
console.error("Error");
```

### 3. Autenticación

**Middleware `isAuthenticated`**:

```javascript
// En routes
fastify.post(
  "/users/profile",
  { preHandler: [fastify.authenticate] },
  getProfile,
);

// En controller
async function getProfile(request, reply) {
  const userId = request.user.userId; // Disponible después de authenticate
  // ...
}
```

### 4. Validación

**Schemas JSON Schema** en `auth.schema.js`, `user.schema.js`, etc.:

```javascript
export const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
    },
  },
};
```

---

## 📊 Estado Actual

### ✅ Completado (Fase 1 + Mejoras)

- ✅ Error handler global + clases de error personalizadas
- ✅ Middlewares reutilizables (isAuthenticated, isOwner, isAdmin)
- ✅ Configuración centralizada con validación de env vars
- ✅ Seguridad: CORS, Helmet, Rate Limiting
- ✅ Todos los services migrados a Prisma + `throw`
- ✅ Todos los controllers sin try/catch
- ✅ Paginación en getAllStories (50x más rápido)
- ✅ Rate limiting específico para auth (5 intentos/15 min)
- ✅ Health check endpoint (`GET /health`)
- ✅ Validación de email en registro
- ✅ Validación de Stripe keys
- ✅ Repository Pattern implementado (10 repositories)
- ✅ Cloudinary integrado para uploads de imágenes
- ✅ 158 tests pasando en la última corrida (con 2 suites fallando por variables de entorno)

### ⏳ Pendiente (Fase 3.7 - Nice to Have)

- [ ] Transacciones de Prisma para operaciones críticas
- [ ] Tests unitarios y de integración completos (service + integration)
- [ ] Docker setup completo para backend + PostgreSQL
- [ ] Inyección de dependencias
- [ ] Caching con Redis (opcional)
- [ ] GraphQL API (opcional)

---

## 📸 Uploads de Imágenes (Cloudinary)

**Cómo funciona**:

1. Cliente envía archivo en multipart/form-data
2. Backend recibe con `req.parts()`
3. Sube a Cloudinary (servicio externo)
4. Retorna URL segura
5. Se guarda URL en BD (no el archivo)

**Funciones disponibles** en `src/utils/fileUpload.js`:

```javascript
import {
  uploadAvatar,
  uploadCover,
  uploadChapterImage,
} from "../../utils/fileUpload.js";

// En controller
const avatarUrl = await uploadAvatar(file);
const coverUrl = await uploadCover(file);
const chapterImageUrl = await uploadChapterImage(file);
```

**Variables de entorno necesarias**:

```
CLOUDINARY_CLOUD_NAME=di4qby2sl
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Beneficios**:

- ✅ 25 GB/mes gratis
- ✅ CDN global incluido
- ✅ Transformaciones automáticas
- ✅ No consume espacio del servidor
- ✅ Escalable para producción

---

```bash
# Desarrollo
pnpm dev                 # Iniciar servidor
pnpm test               # Ejecutar tests
pnpm test:watch         # Tests en modo watch

# Prisma
pnpm prisma migrate dev # Crear migración
pnpm prisma studio     # Abrir Prisma Studio

# Tests focalizados
pnpm test src/__tests__/auth/auth.service.test.js
```

---

## 🚀 Cómo Hacer Cambios

### 1. Agregar Nueva Funcionalidad

```
1. Crear archivo en src/features/[feature]/
2. Implementar service (lanzar errores con throw)
3. Implementar controller (sin try/catch)
4. Crear routes
5. Crear schema de validación
6. Agregar tests
```

### 2. Corregir Bug

```
1. Identificar en qué service/controller está
2. Lanzar error apropiado (ValidationError, NotFoundError, etc.)
3. Error handler global lo capturará
4. Agregar test para evitar regresión
```

### 3. Agregar Middleware

```
1. Crear en src/middlewares/[nombre].js
2. Exportar como función async
3. Registrar en app.js o en routes específicas
4. Usar en preHandler de rutas
```

---

## 📚 Documentación Completa

- **ESTADO.md** - Estado actual, tareas pendientes, progreso detallado
- **Context.md** - Arquitectura, patrones, decisiones de diseño
- **README.md** - Overview del proyecto

---

## 🎯 Próximos Pasos

1. **Inmediato**: Implementar transacciones de Prisma en donaciones y confirmación de pagos
2. **Corto plazo**: Cerrar brechas de tests en `donations` y `transactions`
3. **Mediano plazo**: Docker setup completo para backend + PostgreSQL

---

## ⚡ Tips para Agentes IA

1. **Antes de hacer cambios**: Lee ESTADO.md para ver qué está completado
2. **Para entender arquitectura**: Lee Context.md
3. **Para ver patrones**: Busca en `src/features/auth/` (módulo más completo)
4. **Para agregar feature**: Copia estructura de `src/features/users/`
5. **Para errores**: Usa clases de `src/utils/errors.js`
6. **Para logging**: Usa `request.log` (no console.log)

---

**Última actualización**: 07/04/2026  
**Estado**: Fase 1 ✅ | Fase 2 ✅ | Fase 3.1-3.6 ✅ | Fase 3.7 ⏳
