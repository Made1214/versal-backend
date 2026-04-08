# API Endpoints - Versal Backend

**Base URL:** `http://localhost:3000/api`

## Autenticación

Los endpoints protegidos requieren: `Authorization: Bearer <token>`

---

## 🔐 Auth Endpoints

### POST /auth/register

Registra un nuevo usuario.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "username": "username",
  "fullName": "Full Name"
}
```

**Response 201:**

```json
{
  "user": { "id": "...", "email": "...", "username": "..." },
  "accessToken": "jwt_token"
}
```

### POST /auth/login

Inicia sesión.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response 200:**

```json
{
  "user": { "id": "...", "email": "...", "username": "..." },
  "accessToken": "jwt_token"
}
```

### GET /auth/me

Obtiene el usuario actual. **Requiere autenticación.**

**Response 200:**

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "username": "...",
    "role": "USER|ADMIN"
  }
}
```

### POST /auth/refresh

Refresca el token de acceso usando el `refreshToken` en cookie `httpOnly`.

**Response 200:**

```json
{
  "accessToken": "new_jwt_token"
}
```

### POST /auth/logout

Cierra sesión del usuario.

**Response 200:**

```json
{
  "message": "Sesión cerrada exitosamente"
}
```

### POST /auth/forgot-password

Solicita recuperación de contraseña.

**Body:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "message": "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
}
```

### POST /auth/reset-password

Resetea la contraseña con el token recibido.

**Body:**

```json
{
  "email": "user@example.com",
  "token": "reset_token",
  "newPassword": "NewPassword123!"
}
```

### GET /auth/oauth/google

Inicia el flujo de autenticación con Google OAuth.

**Nota:** Endpoint disponible solo si el servidor tiene configuradas las variables de entorno de Google OAuth.
Este endpoint lo expone el plugin `@fastify/oauth2` mediante `startRedirectPath`.

### GET /auth/oauth/google/callback

Callback de Google OAuth.

---

## 📚 Stories Endpoints

### GET /stories

Obtiene todas las historias publicadas.

**Query Params:**

- `search` (opcional): Buscar por título o descripción
- `categoryName` (opcional): Filtrar por categoría
- `tagName` (opcional): Filtrar por etiqueta

**Response 200:**

```json
{
  "stories": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "author": { "username": "...", "profileImage": "..." },
      "category": { "name": "..." },
      "tags": [{ "name": "..." }],
      "status": "published",
      "viewCount": 0,
      "createdAt": "..."
    }
  ]
}
```

### GET /stories/:id

Obtiene una historia por ID.

**Response 200:**

```json
{
  "story": {
    "id": "...",
    "title": "...",
    "description": "...",
    "author": { "username": "...", "profileImage": "..." },
    "category": { "name": "..." },
    "tags": [{ "name": "..." }],
    "chapters": [...],
    "status": "published"
  }
}
```

### POST /stories

Crea una nueva historia. **Requiere autenticación.**

**Body:** Multipart form-data con campos y archivo de portada.

- `title` (required)
- `description`
- `category`
- `tags` (JSON array)
- `language`
- `isAdultContent`
- `coverImage` (file, requerido)

**Response 201:**

```json
{
  "story": { "id": "...", "title": "...", "status": "draft", ... }
}
```

### PATCH /stories/:id

Actualiza una historia. **Requiere autenticación y ser el autor.**

**Body:** Puede ser multipart form-data o JSON.

```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "status": "published",
  "category": "Romance",
  "tags": ["amor", "drama"]
}
```

### DELETE /stories/:id

Elimina una historia. **Requiere autenticación y ser el autor.**

**Response 200:**

```json
{
  "message": "Historia eliminada exitosamente"
}
```

### GET /stories/me

Obtiene las historias del autor autenticado. **Requiere autenticación.**

**Response 200:**

```json
{
  "stories": [ ... ]
}
```

### GET /stories/categories

Obtiene todas las categorías disponibles.

**Response 200:**

```json
{
  "categories": [
    { "id": "...", "name": "Aventura" },
    { "id": "...", "name": "Romance" }
  ]
}
```

### GET /stories/tags

Obtiene todas las etiquetas disponibles.

**Response 200:**

```json
{
  "tags": [
    { "id": "...", "name": "magia" },
    { "id": "...", "name": "fantasía" }
  ]
}
```

### GET /stories/author/:authorId

Obtiene historias de un autor específico. **No requiere autenticación.**

### GET /stories/category/:categoryName

Obtiene historias por categoría.

### GET /stories/tag/:tagName

Obtiene historias por etiqueta.

---

## 📖 Chapters Endpoints

### GET /stories/:storyId/chapters

Obtiene todos los capítulos de una historia.

**Response 200:**

```json
{
  "chapters": [
    {
      "id": "...",
      "chapterNumber": 1,
      "title": "Capítulo 1",
      "content": "<p>Contenido HTML...</p>",
      "status": "published",
      "publishedAt": "...",
      "createdAt": "..."
    }
  ]
}
```

### GET /chapters/:id

Obtiene un capítulo por ID.

**Response 200:**

```json
{
  "chapter": {
    "id": "...",
    "title": "...",
    "content": "...",
    "chapterNumber": 1,
    "story": { "title": "...", "authorId": "..." }
  }
}
```

### POST /stories/:storyId/chapters

Crea un nuevo capítulo. **Requiere autenticación y ser el autor.**

**Body:**

```json
{
  "title": "Título del capítulo",
  "content": "<p>Contenido HTML del capítulo</p>",
  "status": "draft"
}
```

**Response 201:**

```json
{
  "chapter": {
    "id": "...",
    "chapterNumber": 2,
    "title": "...",
    "status": "draft"
  }
}
```

### PUT /chapters/:id

Actualiza un capítulo. **Requiere autenticación y ser el autor.**

**Body:**

```json
{
  "title": "Nuevo título",
  "content": "<p>Nuevo contenido</p>",
  "status": "published"
}
```

### DELETE /chapters/:id

Elimina un capítulo. **Requiere autenticación y ser el autor.**

### POST /chapters/upload-image

Sube una imagen para un capítulo. **Requiere autenticación.**

**Body:** Multipart form-data con el archivo de imagen.

**Response 200:**

```json
{
  "url": "https://cloudinary.com/..."
}
```

### GET /stories/:storyId/published-chapters-count

Obtiene el conteo de capítulos publicados de una historia.

**Response 200:**

```json
{
  "publishedChapterCount": 5
}
```

---

## 👥 Users Endpoints

### GET /users/:id/followers

Obtiene los seguidores de un usuario.

**Response 200:**

```json
{
  "followers": [{ "id": "...", "username": "...", "profileImage": "..." }]
}
```

### GET /users/:id/following

Obtiene los usuarios que sigue un usuario.

**Response 200:**

```json
{
  "following": [{ "id": "...", "username": "...", "profileImage": "..." }]
}
```

### POST /users/:id/follow

Sigue a un usuario. **Requiere autenticación.**

### POST /users/:id/unfollow

Deja de seguir a un usuario. **Requiere autenticación.**

### POST /users/:id/block

Bloquea a un usuario. **Requiere autenticación.**

### POST /users/:id/unblock

Desbloquea a un usuario. **Requiere autenticación.**

### GET /users/me/blocked

Obtiene la lista de usuarios bloqueados del usuario autenticado. **Requiere autenticación.**

### GET /users/:id

Obtiene el perfil de un usuario por ID. **Requiere autenticación.**

### PUT /users/me

Actualiza el perfil del usuario autenticado. **Requiere autenticación.**

**Body:**

```json
{
  "fullName": "Nuevo Nombre",
  "username": "nuevo_username",
  "bio": "Mi biografía",
  "profileImage": "https://..."
}
```

### PUT /users/me/password

Cambia la contraseña del usuario autenticado. **Requiere autenticación.**

**Body:**

```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### GET /users/all

Obtiene todos los usuarios. **Requiere autenticación y rol admin.**

**Response 200:**

```json
[{ "id": "...", "username": "...", "email": "...", "role": "USER" }]
```

### DELETE /users/:id

Elimina un usuario. **Requiere autenticación y rol admin.**

**Response 200:**

```json
{
  "message": "Usuario eliminado exitosamente"
}
```

### PUT /users/:userId/role

Actualiza el rol de un usuario. **Requiere autenticación y rol admin.**

**Body:**

```json
{
  "role": "ADMIN"
}
```

`role` también acepta `admin|user` por compatibilidad, pero se normaliza internamente a `ADMIN|USER`.

**Response 200:**

```json
{
  "id": "...",
  "username": "...",
  "email": "...",
  "role": "ADMIN"
}
```

---

## ❤️ Favorites Endpoints

### GET /favorites/me/favorites

Obtiene las historias favoritas del usuario. **Requiere autenticación.**

**Response 200:**

```json
{
  "stories": [
    {
      "id": "...",
      "title": "...",
      "author": { "username": "..." }
    }
  ]
}
```

### POST /favorites/stories/:storyId/favorite

Agrega o quita una historia de favoritos. **Requiere autenticación.**

**Response 200:**

```json
{
  "status": "favorited"
}
```

### GET /favorites/stories/:storyId/isFavorite

Verifica si una historia es favorita. **Requiere autenticación.**

**Response 200:**

```json
{
  "isFavorite": true
}
```

---

## 💬 Interactions Endpoints

### GET /chapters/:id/interactions

Obtiene las interacciones (likes y comentarios) de un capítulo.

**Response 200:**

```json
{
  "likesCount": 10,
  "comments": [
    {
      "id": "...",
      "user": { "username": "...", "profileImage": "..." },
      "interactionType": "comment",
      "text": "Excelente capítulo!",
      "createdAt": "..."
    }
  ]
}
```

### POST /chapters/:id/interactions

Agrega una interacción (like o comentario) a un capítulo. **Requiere autenticación.**

**Body:**

```json
{
  "interactionType": "like"
}
```

o

```json
{
  "interactionType": "comment",
  "text": "Excelente capítulo!"
}
```

### DELETE /interactions/:interactionId

Elimina un like o un comentario. **Requiere autenticación.**

---

## 🚨 Reports Endpoints

### POST /reports

Crea un reporte de contenido. **Requiere autenticación.**

**Body:**

```json
{
  "contentId": "story_or_comment_id",
  "onModel": "Story",
  "reason": "Spam",
  "details": "Detalles adicionales (opcional)"
}
```

**Razones válidas:**

- `Spam`
- `Contenido de odio`
- `Acoso`
- `Información falsa`
- `Contenido explícito`
- `Violencia`
- `Otro`

**Response 201:**

```json
{
  "report": {
    "id": "...",
    "status": "pending",
    "reason": "Spam",
    "createdAt": "..."
  }
}
```

### GET /admin/reports

Obtiene todos los reportes. **Requiere autenticación y rol admin.**

**Query Params:**

- `status` (opcional): `pending`, `in_review`, `resolved`, `dismissed`

**Response 200:**

```json
{
  "reports": [
    {
      "id": "...",
      "user": { "username": "..." },
      "contentId": "...",
      "reason": "...",
      "status": "pending",
      "createdAt": "..."
    }
  ]
}
```

### PATCH /admin/reports/:reportId

Actualiza el estado de un reporte. **Requiere autenticación y rol admin.**

**Body:**

```json
{
  "status": "resolved"
}
```

**Estados válidos:**

- `in_review`
- `resolved`
- `dismissed`

---

## 💰 Transactions Endpoints

### GET /products/subscriptions

Obtiene los planes de suscripción disponibles.

**Response 200:**

```json
{
  "plans": [
    {
      "id": "basic",
      "name": "Plan Básico",
      "description": "Acceso básico",
      "stripePriceId": "price_..."
    }
  ]
}
```

### GET /products/coin-packs

Obtiene los paquetes de monedas disponibles.

**Response 200:**

```json
{
  "packs": [
    {
      "id": "pack_100",
      "name": "100 Monedas",
      "description": "Paquete de 100 monedas",
      "coins": 100,
      "stripePriceId": "price_..."
    }
  ]
}
```

### POST /transactions/checkout/subscription

Crea una sesión de checkout para suscripción. **Requiere autenticación.**

**Body:**

```json
{
  "planId": "price_stripe_id"
}
```

**Response 200:**

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /transactions/checkout/coin-pack

Crea una sesión de checkout para compra de pack de monedas. **Requiere autenticación.**

**Body:**

```json
{
  "coinPackId": "price_stripe_id"
}
```

**Response 200:**

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### GET /transactions/me

Obtiene el historial de transacciones del usuario. **Requiere autenticación.**

**Response 200:**

```json
{
  "transactions": [
    {
      "id": "...",
      "type": "subscription",
      "amount": 9.99,
      "currency": "usd",
      "status": "completed",
      "createdAt": "..."
    }
  ]
}
```

### GET /transactions/balance

Obtiene el balance de Stripe. **Requiere autenticación.**

**Response 200:**

```json
{
  "balance": {
    "available": [ ... ],
    "pending": [ ... ]
  }
}
```

### POST /transactions/stripe-webhook

Webhook de Stripe para procesar eventos de pago.

**Headers:**

- `stripe-signature`: Firma de Stripe

---

## 💸 Donations Endpoints

### POST /donations/stories/:storyId/donate

Realiza una donación a un autor a partir de una historia. **Requiere autenticación.**

**Body:**

```json
{
  "amount": 5,
  "message": "¡Excelente historia!"
}
```

**Response 201:**

```json
{
  "success": true,
  "donation": {
    "_id": "...",
    "amount": 5,
    "donatorId": "...",
    "recipientId": "...",
    "storyId": "...",
    "message": "¡Excelente historia!",
    "createdAt": "..."
  }
}
```

---

## Códigos de Error Comunes

### 400 Bad Request

```json
{
  "error": "ValidationError",
  "message": "Descripción del error de validación",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "error": "UnauthorizedError",
  "message": "Autenticación requerida",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "error": "ForbiddenError",
  "message": "No tienes permisos para realizar esta acción",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "error": "NotFoundError",
  "message": "Recurso no encontrado",
  "statusCode": 404
}
```

### 500 Internal Server Error

```json
{
  "error": "InternalServerError",
  "message": "Error interno del servidor",
  "statusCode": 500
}
```

---

## Notas Importantes

1. **Autenticación**: Los endpoints protegidos requieren el header `Authorization: Bearer <token>`
2. **Paginación**: Algunos endpoints soportan paginación con `?page=1&limit=20`
3. **Filtros**: Los endpoints de listado soportan filtros mediante query params
4. **Validación**: Todos los datos son validados según los schemas definidos
5. **Rate Limiting**: Los endpoints de auth tienen rate limiting especial
6. **CORS**: La API tiene CORS habilitado para el frontend configurado

---

## Ejemplos de Uso

### Registro y Login

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!","username":"testuser","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'
```

### Crear una Historia

```bash
# Obtener token primero (del login)
TOKEN="your_jwt_token_here"

# Crear historia
curl -X POST http://localhost:3000/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Mi Primera Historia",
    "description": "Una historia increíble",
    "category": "Aventura",
    "tags": ["magia", "fantasía"]
  }'
```

### Crear un Capítulo

```bash
curl -X POST http://localhost:3000/api/stories/STORY_ID/chapters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Capítulo 1: El Comienzo",
    "content": "<p>Érase una vez...</p>",
    "status": "published"
  }'
```

### Dar Like a un Capítulo

```bash
curl -X POST http://localhost:3000/api/chapters/CHAPTER_ID/like \
  -H "Authorization: Bearer $TOKEN"
```

### Agregar a Favoritos

```bash
curl -X POST http://localhost:3000/api/favorites/stories/STORY_ID/favorite \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing con Postman

El proyecto incluye una colección de Postman preconfigurada:

1. Importar `.postman.json` en Postman
2. Importar `.postman-environment.json` como environment
3. Ejecutar el endpoint de Login
4. El token se guardará automáticamente en las variables
5. Los demás endpoints usarán el token automáticamente

---

## Recursos Adicionales

- [Guía de Testing](./TESTING.md)
- [Resumen de Tests](./RESUMEN_TESTS.md)
- [README Principal](../README.md)

---

**Última actualización:** Abril 2026
**Versión de la API:** 1.0.0
