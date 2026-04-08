FROM node:20-slim AS base

WORKDIR /app

# Activa corepack y fija pnpm para builds reproducibles.
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

FROM base AS deps

# Instala dependencias primero para aprovechar cache por capas.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Prisma Client se genera una sola vez y se reutiliza en los stages siguientes.
COPY prisma ./prisma
RUN pnpm prisma generate

FROM deps AS development

COPY . ./

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "dev"]

FROM deps AS production-build

COPY . ./

# Deja solo dependencias de runtime para reducir tamaño final.
RUN pnpm prune --prod

FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=production-build /app/node_modules ./node_modules
COPY --from=production-build /app/package.json ./package.json
COPY --from=production-build /app/app.js ./app.js
COPY --from=production-build /app/src ./src
COPY --from=production-build /app/prisma ./prisma

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "app.js"]
