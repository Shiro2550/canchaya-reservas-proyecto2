/**
 * Característica 3 de specs/acceptance-criteria.md: consulta y cancelación por código,
 * ventana de 2 horas (BR-05), estados terminales (BR-04) y límite de intentos (429).
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "../../src/backend/src/db/client";
import { fixedClock } from "../../src/backend/src/domain/clock";
import { createBooking, makeApp, NOW_PANAMA_1400 } from "../helpers/api";
import { createTestPrisma, resetDatabase } from "../helpers/db";

let prisma: PrismaClient;
let at1400: FastifyInstance; // 14:00 en Panamá
let at1715: FastifyInstance; // 17:15 en Panamá
let code: string;

beforeAll(async () => {
  prisma = createTestPrisma();
  at1400 = await makeApp(prisma, fixedClock(NOW_PANAMA_1400));
  at1715 = await makeApp(prisma, fixedClock("2026-11-20T22:15:00.000Z"));
});
afterAll(async () => {
  await at1400?.close();
  await at1715?.close();
  await prisma?.$disconnect();
});

// Reserva activa para las 18:00 del 2026-11-20, creada a las 14:00.
beforeEach(async () => {
  await resetDatabase(prisma);
  const res = await createBooking(at1400, { start_time: "18:00" });
  code = res.json().booking_id;
});

describe("Consulta por código (US-04, RF-06)", () => {
  it("devuelve la reserva confirmada con cancha, fecha, horas y estado", async () => {
    const res = await at1400.inject({ method: "GET", url: `/api/v1/bookings/${code}` });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      booking_id: code,
      court_id: "C1",
      court_name: "Cancha 1 - Fútbol 7 Sintético",
      date: "2026-11-20",
      start_time: "18:00",
      end_time: "19:00",
      status: "CONFIRMADA",
    });
  });

  it.each([
    ["inexistente", "CY-ZZZZZZZZ"],
    ["mal formado", "abc"],
    ["en minúsculas", "cy-zzzzzzzz"],
  ])("responde 404 con el mismo mensaje para un código %s", async (_name, value) => {
    const res = await at1400.inject({ method: "GET", url: `/api/v1/bookings/${value}` });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: { code: "BOOKING_NOT_FOUND", message: "No se encontró ninguna reserva asociada al código provisto." },
    });
  });

  it("expone como COMPLETADA una reserva cuyo turno ya terminó, sin modificar la base", async () => {
    const at1930 = await makeApp(prisma, fixedClock("2026-11-21T00:30:00.000Z")); // 19:30 en Panamá
    try {
      const res = await at1930.inject({ method: "GET", url: `/api/v1/bookings/${code}` });
      expect(res.json().status).toBe("COMPLETADA");
      const stored = await prisma.booking.findUniqueOrThrow({ where: { bookingCode: code } });
      expect(stored.status).toBe("CONFIRMADA");
    } finally {
      await at1930.close();
    }
  });
});

describe("Cancelación (US-05, BR-05)", () => {
  it("cancela a tiempo (4 horas antes): 200, CANCELADA, libera el turno y audita", async () => {
    const res = await at1400.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("CANCELADA");

    const stored = await prisma.booking.findUniqueOrThrow({ where: { bookingCode: code }, include: { events: true } });
    expect(stored.cancelledAt).not.toBeNull();
    expect(stored.events.map((e) => e.eventType).sort()).toEqual(["CANCELLED", "CREATED"]);

    const grid = await at1400.inject({ method: "GET", url: "/api/v1/courts/C1/availability?date=2026-11-20" });
    expect(grid.json().find((s: { start_time: string }) => s.start_time === "18:00").status).toBe("DISPONIBLE");
  });

  it("rechaza la cancelación tardía (45 minutos antes) con 400 y la reserva sigue CONFIRMADA", async () => {
    const res = await at1715.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: "LATE_CANCELLATION",
        message: "No es posible cancelar la reserva: el plazo límite es de 2 horas previas al inicio del turno.",
      },
    });
    const stored = await prisma.booking.findUniqueOrThrow({ where: { bookingCode: code } });
    expect(stored.status).toBe("CONFIRMADA");
  });

  it("rechaza cancelar una reserva ya cancelada con 409, aunque falten menos de 2 horas", async () => {
    await at1400.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` });
    const res = await at1715.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: {
        code: "INVALID_STATE_TRANSITION",
        message: "La reserva no puede cancelarse porque ya se encuentra cancelada o completada.",
      },
    });
  });

  it("dos cancelaciones simultáneas: una responde 200 y la otra 409", async () => {
    const results = await Promise.all([
      at1400.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` }),
      at1400.inject({ method: "POST", url: `/api/v1/bookings/${code}/cancel` }),
    ]);
    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect(await prisma.bookingEvent.count({ where: { eventType: "CANCELLED" } })).toBe(1);
  });

  it("responde 404 al cancelar un código inexistente", async () => {
    const res = await at1400.inject({ method: "POST", url: "/api/v1/bookings/CY-ZZZZZZZZ/cancel" });
    expect(res.statusCode).toBe(404);
  });
});

describe("Límite de intentos por código (ADR-002)", () => {
  it("después de 3 consultas por minuto desde la misma IP responde 429 RATE_LIMITED", async () => {
    const limited = await makeApp(prisma, fixedClock(NOW_PANAMA_1400), { max: 3, timeWindow: "1 minute" });
    try {
      const statuses: number[] = [];
      for (let i = 0; i < 4; i++) {
        statuses.push((await limited.inject({ method: "GET", url: "/api/v1/bookings/CY-ZZZZZZZZ" })).statusCode);
      }
      expect(statuses).toEqual([404, 404, 404, 429]);
      const last = await limited.inject({ method: "GET", url: "/api/v1/bookings/CY-ZZZZZZZZ" });
      expect(last.json().error.code).toBe("RATE_LIMITED");
    } finally {
      await limited.close();
    }
  });
});
