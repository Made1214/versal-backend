# 🚀 Versal Backend

Backend de Versal - Plataforma de historias interactivas.

## 📚 Documentación

### Para Agentes IA (Ubicación: `docs/ai/`)

- **[QUICK_START.md](docs/ai/QUICK_START.md)** - Resumen de 1 página (comienza aquí) ⭐
- **[ESTADO.md](docs/ai/ESTADO.md)** - Estado actual, tareas pendientes, progreso
- **[Context.md](docs/ai/Context.md)** - Arquitectura, patrones, convenciones

### Para Desarrolladores

- **[ENDPOINTS.md](docs/ENDPOINTS.md)** - Documentación completa de API ⭐

---

## 🛠️ Stack

- **Backend**: Fastify
- **ORM**: Prisma
- **BD**: PostgreSQL
- **Autenticación**: JWT + Cookies httpOnly
- **Tests**: Vitest
- **Pagos**: Stripe

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
pnpm prisma migrate dev

# Iniciar servidor
pnpm dev

# Ejecutar tests
pnpm test
```

---

## 📊 Estado del Proyecto

- ✅ **Fase 1**: 100% Completada
- ✅ **Mejoras Adicionales**: 7 completadas
- ⏳ **Fase 2**: Próxima

Ver [ESTADO.md](docs/ai/ESTADO.md) para detalles completos.

---

## 📁 Estructura

```
src/
  features/        ← Módulos por feature
  config/          ← Configuración centralizada
  middlewares/     ← Middlewares reutilizables
  utils/           ← Utilidades (errors, validate)
  plugins/         ← Plugins de Fastify
  __tests__/       ← Tests (83 tests pasando)
```

---

## 🎯 Patrones Clave

### Manejo de Errores

Services lanzan errores (no retornan `{ error }`):
```javascript
throw new ValidationError("Email is required");
throw new NotFoundError("User not found");
```

Controllers sin try/catch (error handler global captura todo):
```javascript
async function getUser(request, reply) {
  const user = await userService.getUser(request.params.userId);
  return reply.send({ user });
}
```

### Logging

Usar logger de Fastify (no console.log):
```javascript
request.log.info("User created", { userId: user.id });
```

### Autenticación

Usar middlewares reutilizables:
```javascript
fastify.post("/profile", 
  { preHandler: [fastify.authenticate] },
  getProfile
);
```

---

## 📖 Documentación Completa

Para documentación detallada, ver:
- **[docs/ai/QUICK_START.md](docs/ai/QUICK_START.md)** - Resumen rápido
- **[docs/ai/ESTADO.md](docs/ai/ESTADO.md)** - Estado y tareas
- **[docs/ai/Context.md](docs/ai/Context.md)** - Arquitectura y patrones

---

## 🔗 Enlaces Útiles

- [Fastify Docs](https://www.fastify.io/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Vitest Docs](https://vitest.dev/)

---

**Última actualización**: 31/03/2026  
**Estado**: Fase 1 ✅ + Mejoras ✅ | Fase 2 ⏳
