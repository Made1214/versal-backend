import { vi } from 'vitest';

/**
 * Crea un objeto request mock para tests de controllers
 * @param {Object} overrides - Propiedades para sobrescribir
 * @returns {Object} Mock request object
 */
export const createMockRequest = (overrides = {}) => ({
  user: {
    id: 'user-123',
    userId: 'user-123', // Prisma usa userId en algunos lugares
    role: 'user',
  },
  params: {},
  query: {},
  body: {},
  headers: {},
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  ...overrides,
});

/**
 * Crea un objeto reply mock para tests de controllers
 * @returns {Object} Mock reply object con métodos encadenables
 */
export const createMockReply = () => {
  const reply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    headers: vi.fn().mockReturnThis(),
    type: vi.fn().mockReturnThis(),
    setCookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  return reply;
};

/**
 * Genera un JWT token válido para tests de integración
 * @param {Object} app - Instancia de Fastify con plugin JWT
 * @param {Object} payload - Payload del token (default: user básico)
 * @returns {String} JWT token
 */
export const generateJWT = (app, payload = { id: 'user-123', role: 'user' }) => {
  return app.jwt.sign(payload);
};

/**
 * Genera un JWT token de admin para tests de integración
 * @param {Object} app - Instancia de Fastify con plugin JWT
 * @returns {String} JWT token de admin
 */
export const generateAdminJWT = (app) => {
  return app.jwt.sign({ id: 'admin-123', role: 'admin' });
};

/**
 * Crea headers de autenticación para requests de integración
 * @param {String} token - JWT token
 * @returns {Object} Headers object con Authorization
 */
export const createAuthHeaders = (token) => ({
  authorization: `Bearer ${token}`,
});

/**
 * Espera un tiempo determinado (útil para tests asíncronos)
 * @param {Number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que se resuelve después del tiempo
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Limpia todos los mocks de Vitest
 * Útil en beforeEach para asegurar tests independientes
 */
export const clearAllMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

/**
 * Crea un mock de Fastify app para tests unitarios de controllers
 * @returns {Object} Mock Fastify app
 */
export const createMockFastifyApp = () => ({
  jwt: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    verify: vi.fn().mockReturnValue({ id: 'user-123', role: 'user' }),
  },
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
});

/**
 * Valida que un objeto tenga la estructura esperada
 * @param {Object} obj - Objeto a validar
 * @param {Array<String>} requiredFields - Campos requeridos
 * @returns {Boolean} true si tiene todos los campos
 */
export const hasRequiredFields = (obj, requiredFields) => {
  return requiredFields.every((field) => obj.hasOwnProperty(field));
};

/**
 * Genera datos aleatorios para property-based testing
 */
export const generators = {
  /**
   * Genera un email aleatorio válido
   */
  email: () => {
    const random = Math.random().toString(36).substring(7);
    return `test-${random}@example.com`;
  },

  /**
   * Genera un username aleatorio
   */
  username: () => {
    const random = Math.random().toString(36).substring(7);
    return `user_${random}`;
  },

  /**
   * Genera una contraseña válida aleatoria
   */
  password: () => {
    const random = Math.random().toString(36).substring(2);
    return `Pass${random}123!`;
  },

  /**
   * Genera un número entero aleatorio entre min y max
   */
  integer: (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Genera un string aleatorio de longitud específica
   */
  string: (length = 10) => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Genera un booleano aleatorio
   */
  boolean: () => {
    return Math.random() < 0.5;
  },

  /**
   * Selecciona un elemento aleatorio de un array
   */
  oneOf: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },
};

/**
 * Valida que un error tenga el tipo y mensaje esperado
 * @param {Error} error - Error a validar
 * @param {String} expectedType - Tipo de error esperado (ej: 'NotFoundError')
 * @param {String} expectedMessage - Mensaje esperado (opcional)
 */
export const expectError = (error, expectedType, expectedMessage = null) => {
  expect(error).toBeDefined();
  expect(error.constructor.name).toBe(expectedType);
  if (expectedMessage) {
    expect(error.message).toContain(expectedMessage);
  }
};

/**
 * Crea un mock de file upload para tests de Fastify multipart
 * @param {Object} options - Opciones del archivo
 * @returns {Object} Mock file object
 */
export const createMockFile = (options = {}) => ({
  filename: options.filename || 'test-file.jpg',
  mimetype: options.mimetype || 'image/jpeg',
  encoding: options.encoding || '7bit',
  file: {
    pipe: vi.fn(),
    on: vi.fn(),
  },
  ...options,
});
