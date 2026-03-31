import { vi } from 'vitest';

/**
 * Crea un mock completo del cliente Prisma
 * Incluye todos los modelos usados en el backend
 */
export const createPrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  story: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  chapter: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  follow: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  block: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  chapterLike: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  comment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  report: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  transaction: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  donation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tag: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  storyTag: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  passwordReset: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
});

/**
 * Crea un mock de bcrypt para hashing y comparación de contraseñas
 */
export const createBcryptMock = () => ({
  hash: vi.fn().mockResolvedValue('$2b$10$hashedPassword123'),
  compare: vi.fn().mockResolvedValue(true),
});

/**
 * Crea un mock del módulo crypto de Node.js
 */
export const createCryptoMock = () => ({
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed-token-abc123'),
  }),
  randomBytes: vi.fn().mockReturnValue({
    toString: vi.fn().mockReturnValue('random-token-xyz789'),
  }),
});

/**
 * Crea un mock completo del SDK de Stripe
 */
export const createStripeMock = () => ({
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: 'cs_test_123456',
        url: 'https://checkout.stripe.com/test/session',
        customer: 'cus_test_123',
        mode: 'payment',
        amount_total: 1000,
        currency: 'usd',
        metadata: {},
      }),
    },
  },
  customers: {
    create: vi.fn().mockResolvedValue({
      id: 'cus_test_123456',
      email: 'test@example.com',
      name: 'Test User',
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'cus_test_123456',
      email: 'test@example.com',
    }),
  },
  subscriptions: {
    create: vi.fn().mockResolvedValue({
      id: 'sub_test_123456',
      customer: 'cus_test_123',
      status: 'active',
      metadata: { prismaUserId: 'user-123' },
      items: {
        data: [{ price: { id: 'price_test_123' } }],
      },
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'sub_test_123456',
      customer: 'cus_test_123',
      status: 'active',
      metadata: { prismaUserId: 'user-123' },
      items: {
        data: [{ price: { id: 'price_test_123' } }],
      },
    }),
    update: vi.fn().mockResolvedValue({
      id: 'sub_test_123456',
      status: 'canceled',
    }),
  },
  paymentIntents: {
    create: vi.fn().mockResolvedValue({
      id: 'pi_test_123456',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'pi_test_123456',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
    }),
  },
  balance: {
    retrieve: vi.fn().mockResolvedValue({
      available: [{ amount: 100000, currency: 'usd' }],
      pending: [{ amount: 0, currency: 'usd' }],
    }),
  },
  webhooks: {
    constructEvent: vi.fn((payload, signature, secret) => {
      // Mock básico que retorna el payload como evento
      return JSON.parse(payload);
    }),
  },
});
