#!/bin/sh
# Arranque del contenedor de la app: migraciones → datos iniciales → API (+ web compilada).
set -e
cd /app/src/backend

echo "[canchaya] Aplicando migraciones de la base de datos..."
npx --no-install prisma migrate deploy

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "[canchaya] Cargando canchas iniciales (idempotente)..."
  npx --no-install tsx prisma/seed.ts
fi

echo "[canchaya] Iniciando la API en http://${API_HOST}:${API_PORT} (web y /docs incluidos)"
exec npx --no-install tsx src/server.ts
