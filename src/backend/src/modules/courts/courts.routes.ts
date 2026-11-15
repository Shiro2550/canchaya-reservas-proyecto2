import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  availabilityQuerySchema,
  availabilitySlotSchema,
  courtIdSchema,
  courtResponseSchema,
  errorResponseSchema,
} from "@canchaya/shared";
import { CourtsService } from "./courts.service";

export const courtsRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = new CourtsService(app.prisma, app.clock, app.timeZone);

  app.get(
    "/courts",
    {
      schema: {
        tags: ["Canchas"],
        summary: "Catálogo de canchas activas (RF-01)",
        response: { 200: z.array(courtResponseSchema) },
      },
    },
    async () => service.listActive(),
  );

  app.get(
    "/courts/:id/availability",
    {
      schema: {
        tags: ["Canchas"],
        summary: "Grilla de disponibilidad de una cancha para una fecha (RF-02)",
        params: z.object({ id: courtIdSchema }),
        querystring: availabilityQuerySchema,
        response: {
          200: z.array(availabilitySlotSchema),
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (request) => service.availability(request.params.id, request.query.date),
  );
};
