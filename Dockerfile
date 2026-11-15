# syntax=docker/dockerfile:1
# Imagen de CanchaYa: API (Fastify) + web compilada (React), lista para usar con MySQL 8.4.
# Uso normal: docker compose up -d --build   (ver README, sección «Cómo ejecutar»)

# ---------- base: Node 24 LTS + OpenSSL (lo necesita el motor de migraciones de Prisma)
FROM node:24-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---------- deps: dependencias de los 3 workspaces (se cachea mientras no cambien los package.json)
FROM base AS deps
COPY package.json package-lock.json ./
COPY src/shared/package.json src/shared/
COPY src/frontend/package.json src/frontend/
COPY src/backend/package.json src/backend/prisma.config.ts src/backend/
COPY src/backend/prisma src/backend/prisma
# El postinstall del backend genera el cliente de Prisma a partir de prisma/schema.prisma.
RUN npm ci --no-audit --no-fund

# ---------- build: código fuente + compilación de la web
FROM deps AS build
COPY . .
RUN npm run build -w @canchaya/frontend

# ---------- runtime
FROM base AS runtime
ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=3000 \
    WEB_DIST_DIR=/app/src/frontend/dist \
    TZ_COMPLEX=America/Panama
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["sh", "/app/docker/entrypoint.sh"]
