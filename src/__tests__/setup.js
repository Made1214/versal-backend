import { beforeEach, vi } from 'vitest';
import prismaMock from './__mocks__/prisma.js';

// Configurar el mock de prisma globalmente
vi.mock('../config/prisma.js', () => ({
  default: prismaMock,
}));

// Configurar el mock de cloudinary globalmente
vi.mock('cloudinary', async () => {
  const cloudinaryMock = await import('./__mocks__/cloudinary.js');
  return cloudinaryMock.default;
});

// Limpiar todos los mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks();
});
