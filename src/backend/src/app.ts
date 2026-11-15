import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { COMPLEX_TIMEZONE, ERROR_MESSAGES } from "@canchaya/shared";
import type { PrismaClient } from "./db/client";
import { systemClock, type Clock } from "./domain/clock";
import { bookingsRoutes } from "./modules/bookings/bookings.routes";
import { courtsRoutes } from "./modules/courts/courts.routes";
import { registerErrorHandler } from "./plugins/error-handler";
import { healthRoutes } from "./routes/health";
import { AppError } from "./shared/errors";

export interface CodeRateLimit {
  max: number;
  timeWindow: string | number;
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    clock: Clock;
    timeZone: string;
    codeRateLimit: CodeRateLimit;
  }
}

export interface AppDependencies {
  prisma: PrismaClient;
  clock?: Clock;
  timeZone?: string;
  logger?: FastifyServerOptions["logger"];
  /** Intentos permitidos por IP en consulta/cancelación por código. */
  codeRateLimit?: CodeRateLimit;
  /** Publica la documentación OpenAPI en /docs. */
  docs?: boolean;
}

/**
 * Construye la aplicación sin escuchar en ningún puerto.
 * Las pruebas la usan con `app.inject()` y un reloj fijo (RNF-05).
 */
export async function buildApp({
  prisma,
  clock = systemClock,
  timeZone = COMPLEX_TIMEZONE,
  logger = false,
  codeRateLimit = { max: 30, timeWindow: "1 minute" },
  docs = false,
}: AppDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("prisma", prisma);
  app.decorate("clock", clock);
  app.decorate("timeZone", timeZone);
  app.decorate("codeRateLimit", codeRateLimit);

  registerErrorHandler(app);

  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: () => new AppError("RATE_LIMITED", ERROR_MESSAGES.RATE_LIMITED),
  });

  if (docs) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "CanchaYa API",
          version: "1.2.0",
          description: "Reserva de canchas deportivas sin login. Contrato: specs/api.md",
        },
      },
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, { routePrefix: "/docs" });
  }

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      await api.register(courtsRoutes);
      await api.register(bookingsRoutes);
    },
    { prefix: "/api/v1" },
  );

  return app;
}
