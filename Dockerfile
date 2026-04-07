FROM node:20-slim

WORKDIR /app

# Activa el corepack y prepara pnpm para la versión especificada.
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Instala las dependencias antes de copiar todo el árbol de código fuente para un mejor uso de la caché.
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# Copia los archivos fuente y genera el cliente de Prisma.
COPY . ./
RUN pnpm prisma generate

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "dev"]
