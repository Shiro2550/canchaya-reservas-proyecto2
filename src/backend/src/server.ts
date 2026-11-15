import { buildApp } from "./app";
import { loadEnv } from "./config/env";
import { createPrismaClient } from "./db/client";

const env = loadEnv();
const prisma = createPrismaClient(env.DATABASE_URL);
const app = await buildApp({
  prisma,
  timeZone: env.TZ_COMPLEX,
  docs: true,
  logger: { level: env.LOG_LEVEL, timestamp: () => `,"time":"${new Date().toISOString()}"` },
});

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Cerrando la API");
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
} catch (err) {
  app.log.error({ err }, "No se pudo iniciar la API");
  await prisma.$disconnect();
  process.exit(1);
}
