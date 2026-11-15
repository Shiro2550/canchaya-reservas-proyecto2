import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import type { PrismaClient } from "./db/client";
import { systemClock, type Clock } from "./domain/clock";
import { registerErrorHandler } from "./plugins/error-handler";
import { healthRoutes } from "./routes/health";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    clock: Clock;
  }
}

export interface AppDependencies {
  prisma: PrismaClient;
  clock?: Clock;
  logger?: FastifyServerOptions["logger"];
}

/**
 * Construye la aplicación sin escuchar en ningún puerto.
 * Las pruebas la usan con `app.inject()` y un reloj fijo (RNF-05).
 */
export async function buildApp({ prisma, clock = systemClock, logger = false }: AppDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("prisma", prisma);
  app.decorate("clock", clock);

  registerErrorHandler(app);

  await app.register(healthRoutes, { prefix: "/api/v1" });

  return app;
}
