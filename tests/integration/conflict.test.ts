/**
 * PRUEBA OBLIGATORIA — Prevención de doble reserva (BR-01).
 * Característica 1 de specs/acceptance-criteria.md + concurrencia real contra MySQL.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "../../src/backend/src/db/client";
import { createBooking, makeApp } from "../helpers/api";
import { createTestPrisma, resetDatabase } from "../helpers/db";

let prisma: PrismaClient;
let app: FastifyInstance;

beforeAll(async () => {
  prisma = createTestPrisma();
  app = await makeApp(prisma);
});
afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
});

describe("Característica 1: Prevención de doble reserva", () => {
  let existingCode: string;

  // Antecedentes: C1 ya tiene una reserva confirmada el 2026-11-20 de 18:00 a 19:00.
  beforeEach(async () => {
    await resetDatabase(prisma);
    const res = await createBooking(app, { start_time: "18:00" });
    expect(res.statusCode).toBe(201);
    existingCode = res.json().booking_id;
  });

  it("rechaza la reserva en el mismo horario exacto con 409 y no registra nada", async () => {
    const res = await createBooking(app, { start_time: "18:00", customer_name: "Carlos Méndez" });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: {
        code: "BOOKING_CONFLICT",
        message: "La cancha solicitada no está disponible en el horario seleccionado.",
      },
    });
    expect(await prisma.booking.count()).toBe(1);
  });

  it("rechaza una hora no exacta (17:30) con 400 antes de evaluar la colisión", async () => {
    const res = await createBooking(app, { start_time: "17:30" });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toEqual({
      code: "INVALID_TIME_SLOT",
      message: "El inicio del turno debe coincidir con una hora exacta (en punto).",
    });
  });

  it("autoriza el horario contiguo inmediato (19:00) con end_time calculado y código CY-", async () => {
    const res = await createBooking(app, { start_time: "19:00" });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.status).toBe("CONFIRMADA");
    expect(body.end_time).toBe("20:00");
    expect(body.booking_id).toMatch(/^CY-[2-9A-HJ-NP-Z]{8}$/);
  });

  it("autoriza la misma hora en otra cancha (C2)", async () => {
    const res = await createBooking(app, { court_id: "C2", start_time: "18:00" });
    expect(res.statusCode).toBe(201);
  });

  it("permite tomar el horario de una reserva que fue cancelada", async () => {
    const cancel = await app.inject({ method: "POST", url: `/api/v1/bookings/${existingCode}/cancel` });
    expect(cancel.statusCode).toBe(200);
    const res = await createBooking(app, { start_time: "18:00", customer_name: "Ana Ruiz" });
    expect(res.statusCode).toBe(201);
  });
});

describe("Concurrencia: solicitudes simultáneas por el mismo turno", () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  it("de 10 solicitudes simultáneas por C1 a las 20:00, exactamente 1 se confirma y 9 reciben 409", async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => createBooking(app, { start_time: "20:00", customer_name: `Cliente ${i + 1}` })),
    );
    const statuses = results.map((r) => r.statusCode).sort();
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(9);

    const confirmed = await prisma.booking.count({ where: { courtId: "C1", status: "CONFIRMADA" } });
    expect(confirmed).toBe(1);
    expect(await prisma.bookingEvent.count({ where: { eventType: "CREATED" } })).toBe(1);
  });

  it("solicitudes simultáneas por canchas distintas no se bloquean entre sí", async () => {
    const results = await Promise.all([
      createBooking(app, { court_id: "C1", start_time: "21:00" }),
      createBooking(app, { court_id: "C2", start_time: "21:00" }),
    ]);
    expect(results.map((r) => r.statusCode)).toEqual([201, 201]);
  });
});
