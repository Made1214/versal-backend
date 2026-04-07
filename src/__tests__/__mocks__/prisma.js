import { vi } from 'vitest';

// Mock completo del cliente Prisma con todos los métodos necesarios
const createModelMock = () => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  upsert: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

const prismaMock = {
  user: createModelMock(),
  story: createModelMock(),
  chapter: createModelMock(),
  follow: createModelMock(),
  block: createModelMock(),
  favorite: createModelMock(),
  chapterLike: createModelMock(),
  comment: createModelMock(),
  report: createModelMock(),
  transaction: createModelMock(),
  donation: createModelMock(),
  category: createModelMock(),
  tag: createModelMock(),
  storyTag: createModelMock(),
  refreshToken: createModelMock(),
  passwordReset: createModelMock(),
  rating: createModelMock(),
  $on: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn((callback) => callback(prismaMock)),
};

export default prismaMock;
