import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { healthResponseSchema } from "@canchaya/shared";

/** GET /api/v1/health — comprueba que la API responde y que MySQL está disponible. */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        response: { 200: healthResponseSchema, 503: healthResponseSchema },
      },
    },
    async (_request, reply) => {
      const time = app.clock.now().toISOString();
      try {
        await app.prisma.$queryRaw`SELECT 1`;
        return reply.status(200).send({ status: "ok", database: "ok", time });
      } catch (err) {
        app.log.warn({ err }, "La base de datos no responde");
        return reply.status(503).send({ status: "degraded", database: "down", time });
      }
    },
  );
};
