import type { FastifyInstance } from "fastify";
import { buildApp, type CodeRateLimit } from "../../src/backend/src/app";
import { fixedClock, type Clock } from "../../src/backend/src/domain/clock";
import type { PrismaClient } from "../../src/backend/src/db/client";

/** 14:00 del 2026-11-20 en Panamá (UTC−5) = 19:00 UTC. Es la "hora actual" de los escenarios Gherkin. */
export const NOW_PANAMA_1400 = "2026-11-20T19:00:00.000Z";

export function makeApp(
  prisma: PrismaClient,
  clock: Clock = fixedClock(NOW_PANAMA_1400),
  codeRateLimit: CodeRateLimit = { max: 1_000, timeWindow: "1 minute" },
): Promise<FastifyInstance> {
  return buildApp({ prisma, clock, codeRateLimit });
}

export function bookingBody(overrides: Record<string, unknown> = {}) {
  return {
    court_id: "C1",
    date: "2026-11-20",
    start_time: "18:00",
    customer_name: "Carlos Méndez",
    customer_email: "carlos@example.com",
    customer_phone: "+507 6123-4567",
    ...overrides,
  };
}

export async function createBooking(app: FastifyInstance, overrides: Record<string, unknown> = {}) {
  return app.inject({ method: "POST", url: "/api/v1/bookings", payload: bookingBody(overrides) });
}
