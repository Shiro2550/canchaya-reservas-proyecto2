import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { bookingResponseSchema, createBookingRequestSchema, errorResponseSchema } from "@canchaya/shared";
import { BookingsService } from "./bookings.service";

const codeParams = z.object({ booking_id: z.string().max(64) });

export const bookingsRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = new BookingsService(app.prisma, app.clock, app.timeZone);
  // Límite de intentos por IP en las rutas que reciben el código (ADR-002, RF-04).
  const codeRateLimit = { rateLimit: app.codeRateLimit };

  app.post(
    "/bookings",
    {
      schema: {
        tags: ["Reservas"],
        summary: "Crear una reserva sin login (RF-03, BR-01, BR-02)",
        body: createBookingRequestSchema,
        response: {
          201: bookingResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (request, reply) => reply.status(201).send(await service.create(request.body)),
  );

  app.get(
    "/bookings/:booking_id",
    {
      config: codeRateLimit,
      schema: {
        tags: ["Reservas"],
        summary: "Consultar una reserva por su código (RF-06)",
        params: codeParams,
        response: { 200: bookingResponseSchema, 404: errorResponseSchema, 429: errorResponseSchema },
      },
    },
    async (request) => service.findByCode(request.params.booking_id),
  );

  app.post(
    "/bookings/:booking_id/cancel",
    {
      config: codeRateLimit,
      schema: {
        tags: ["Reservas"],
        summary: "Cancelar una reserva con al menos 2 horas de anticipación (RF-07, BR-05)",
        params: codeParams,
        response: {
          200: bookingResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          429: errorResponseSchema,
        },
      },
    },
    async (request) => service.cancel(request.params.booking_id),
  );
};
