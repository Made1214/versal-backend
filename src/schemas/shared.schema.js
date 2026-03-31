/**
 * Schemas compartidos reutilizables
 * Estos schemas se usan en múltiples módulos para evitar duplicación
 */

// ============================================
// SCHEMAS DE USUARIO
// ============================================

export const userBase = {
  type: "object",
  properties: {
    id: { type: "string" },
    fullName: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    profileImage: { type: "string", format: "uri", nullable: true },
    role: { type: "string", enum: ["user", "admin"] },
    bio: { type: "string", nullable: true },
    isDeleted: { type: "boolean", default: false },
    deletedAt: { type: "string", format: "date-time", nullable: true },
    subscription: { type: "object", properties: {} },
    followers: { type: "array", items: { type: "string" } },
    following: { type: "array", items: { type: "string" } },
    blockedUsers: { type: "array", items: { type: "string" } },
  },
};

export const userIdParam = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
};

export const emailProperty = {
  type: "string",
  format: "email",
};

export const passwordProperty = {
  type: "string",
  minLength: 8,
};

// ============================================
// SCHEMAS DE HISTORIAS
// ============================================

export const storyProperties = {
  _id: { type: "string" },
  title: { type: "string" },
  description: { type: "string" },
  coverImage: { type: "string", nullable: true },
  author: {
    type: "object",
    properties: {
      _id: { type: "string" },
      username: { type: "string" },
      profileImage: { type: "string" },
    },
  },
  category: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
    },
    nullable: true,
  },
  tags: {
    type: "array",
    items: {
      type: "object",
      properties: {
        _id: { type: "string" },
        name: { type: "string" },
      },
    },
  },
  chapterCount: { type: "number" },
  status: { type: "string", enum: ["draft", "published", "archived"] },
  isAdultContent: { type: "boolean" },
  totalLikes: { type: "number" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

export const categoryProperties = {
  _id: { type: "string" },
  name: { type: "string" },
};

export const tagProperties = {
  _id: { type: "string" },
  name: { type: "string" },
};

export const authorIdParam = {
  type: "object",
  properties: {
    authorId: { type: "string", description: "ID del autor cuyas historias se desean obtener" },
  },
  required: ["authorId"],
};

// ============================================
// SCHEMAS COMUNES
// ============================================

export const authHeaders = {
  type: "object",
  properties: {
    authorization: { type: "string" },
  },
  required: ["authorization"],
};

export const messageResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
};

export const errorResponse = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
};

export const paginationQuery = {
  type: "object",
  properties: {
    page: { type: "number", default: 1, minimum: 1 },
    limit: { type: "number", default: 20, minimum: 1, maximum: 100 },
  },
};

export const idParam = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
};
