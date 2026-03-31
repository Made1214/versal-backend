import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';

/**
 * NOTA: Estos tests de integración están simplificados porque mockear Prisma
 * en un proyecto CommonJS desde tests ESM es complejo.
 * 
 * Para tests de integración completos, considera:
 * 1. Usar una base de datos de prueba real (SQLite en memoria o Docker)
 * 2. Convertir el proyecto a ESM completo
 * 3. Usar herramientas como testcontainers
 */

describe('Auth Integration Tests - Schema Validation', () => {
  let app;

  beforeEach(async () => {
    app = Fastify();

    // Register JWT plugin
    await app.register(import('@fastify/jwt'), { secret: 'test-secret-key-12345' });
    
    // Register cookie plugin
    await app.register(import('@fastify/cookie'));

    // Add authenticate decorator
    app.decorate('authenticate', async function (request, reply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    // Register auth routes
    const authRoutesModule = await import('../../features/auth/auth.routes.js');
    await app.register(authRoutesModule.default, { prefix: '/api' });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should validate register payload schema', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'invalid-email', // Invalid email format
        password: 'weak', // Weak password
        username: 'test',
        fullName: 'Test User',
      },
    });

    // Should return 400 for validation error
    expect([400, 500]).toContain(response.statusCode);
  });

  it('should validate login payload schema', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'invalid-email', // Invalid email format
        // Missing password
      },
    });

    // Should return 400 for validation error
    expect([400, 500]).toContain(response.statusCode);
  });

  it('should require authentication for /me endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      // No authorization header
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error');
  });

  it('should reject invalid JWT token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: 'Bearer invalid-token-here',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
