import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/config/prisma.js': path.resolve(__dirname, './src/__tests__/__mocks__/prisma.js'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.kiro'],
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
