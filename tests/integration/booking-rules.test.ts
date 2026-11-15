/**
 * Características 2 y 4 de specs/acceptance-criteria.md: creación sin cuenta, validaciones
 * de formato (422), reglas de horario (400) y grilla de disponibilidad.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "../../src/backend/src/db/client";
import { fixedClock } from "../../src/backend/src/domain/clock";
import { bookingBody, createBooking, makeApp } from "../helpers/api";
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
beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("Característica 2: Registro de reserva sin login", () => {
  it("crea la reserva con datos válidos, calcula end_time y registra auditoría", async () => {
    const res = await createBooking(app, { date: "2026-11-25", start_time: "10:00", customer_name: "Juan Pérez" });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toMatchObject({
      court_id: "C1",
      court_name: "Cancha 1 - Fútbol 7 Sintético",
      date: "2026-11-25",
      start_time: "10:00",
      end_time: "11:00",
      customer_name: "Juan Pérez",
      status: "CONFIRMADA",
    });
    expect(body.booking_id).toMatch(/^CY-[2-9A-HJ-NP-Z]{8}$/);
    expect(body.created_at).toMatch(/Z$/);

    const events = await prisma.bookingEvent.findMany();
    expect(events.map((e) => e.eventType)).toEqual(["CREATED"]);
  });

  it("ignora un end_time enviado por el cliente: lo calcula el servidor", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/bookings",
      payload: { ...bookingBody({ start_time: "15:00" }), end_time: "18:00" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().end_time).toBe("16:00");
  });

  it.each([
    ["correo inválido", { customer_email: "correo-invalido-sin-arroba" }, "customer_email"],
    ["teléfono con menos de 7 dígitos", { customer_phone: "12345" }, "entre 7 y 15 dígitos"],
    ["teléfono con más de 15 dígitos", { customer_phone: "1234567890123456" }, "entre 7 y 15 dígitos"],
    ["nombre de 2 caracteres", { customer_name: "Jo" }, "customer_name"],
    ["fecha inexistente", { date: "2026-02-30" }, "date"],
    ["hora fuera de formato", { start_time: "24:00" }, "start_time"],
    ["cancha vacía", { court_id: "" }, "court_id"],
  ])("rechaza %s con 422 VALIDATION_ERROR", async (_name, overrides, expectedInMessage) => {
    const res = await createBooking(app, overrides);
    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
    expect(res.json().error.message).toContain(expectedInMessage);
  });

  it("rechaza un cuerpo sin campos con 422", async () => {
    const res = await app.inject({ method: "POST", url: "/api/v1/bookings", payload: {} });
    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });

  it.each([
    ["06:00 (antes de la apertura)", { date: "2026-11-21", start_time: "06:00" }, "OUT_OF_OPERATING_HOURS",
      "El horario solicitado se encuentra fuera del rango operativo (08:00 - 23:00)."],
    ["23:00 (después del cierre)", { date: "2026-11-21", start_time: "23:00" }, "OUT_OF_OPERATING_HOURS",
      "El horario solicitado se encuentra fuera del rango operativo (08:00 - 23:00)."],
    ["una hora pasada en Panamá", { date: "2026-11-20", start_time: "10:00" }, "PAST_DATE_TIME",
      "No se pueden agendar reservas en fechas u horas pasadas."],
    ["a 32 días (2026-12-22)", { date: "2026-12-22", start_time: "10:00" }, "MAX_ADVANCE_EXCEEDED",
      "No se pueden realizar reservas con más de 30 días de anticipación."],
  ])("rechaza %s con 400", async (_name, overrides, code, message) => {
    const res = await createBooking(app, overrides);
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: { code, message } });
  });

  it("acepta una reserva exactamente a 30 días (2026-12-20)", async () => {
    const res = await createBooking(app, { date: "2026-12-20", start_time: "10:00" });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe("CONFIRMADA");
  });

  it("responde 404 si la cancha no existe (fase 3, después de las reglas de horario)", async () => {
    const res = await createBooking(app, { court_id: "C9", date: "2026-11-21" });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("COURT_NOT_FOUND");
  });

  it("responde 404 si la cancha está inactiva", async () => {
    await prisma.court.update({ where: { id: "C2" }, data: { isActive: false } });
    const res = await createBooking(app, { court_id: "C2", date: "2026-11-21" });
    expect(res.statusCode).toBe(404);
  });

  it("aplica el orden de validación: con formato inválido y hora pasada, responde 422", async () => {
    const res = await createBooking(app, { customer_email: "x", date: "2026-11-19" });
    expect(res.statusCode).toBe(422);
  });
});

describe("Catálogo de canchas (RF-01)", () => {
  it("lista solo las canchas activas con tarifa en texto decimal", async () => {
    await prisma.court.update({ where: { id: "C2" }, data: { isActive: false } });
    const res = await app.inject({ method: "GET", url: "/api/v1/courts" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      { id: "C1", name: "Cancha 1 - Fútbol 7 Sintético", sport: "FUTBOL_7", hourly_rate: "60.00" },
    ]);
  });
});

describe("Característica 4: Grilla de disponibilidad", () => {
  it("el día actual (10:30) marca PASADO las horas iniciadas y OCUPADO las reservadas", async () => {
    const at1030 = await makeApp(prisma, fixedClock("2026-11-20T15:30:00.000Z")); // 10:30 en Panamá
    try {
      expect((await createBooking(at1030, { start_time: "12:00" })).statusCode).toBe(201);
      const res = await at1030.inject({ method: "GET", url: "/api/v1/courts/C1/availability?date=2026-11-20" });
      expect(res.statusCode).toBe(200);
      const slots = res.json() as { start_time: string; status: string; available: boolean }[];
      expect(slots).toHaveLength(15);
      const byTime = Object.fromEntries(slots.map((s) => [s.start_time, s.status]));
      expect(byTime["08:00"]).toBe("PASADO");
      expect(byTime["09:00"]).toBe("PASADO");
      expect(byTime["10:00"]).toBe("PASADO");
      expect(byTime["11:00"]).toBe("DISPONIBLE");
      expect(byTime["12:00"]).toBe("OCUPADO");
      expect(slots.at(-1)).toEqual({ start_time: "22:00", end_time: "23:00", status: "DISPONIBLE", available: true });
    } finally {
      await at1030.close();
    }
  });

  it("una reserva cancelada vuelve a aparecer como DISPONIBLE", async () => {
    const created = await createBooking(app, { date: "2026-11-21", start_time: "18:00" });
    await app.inject({ method: "POST", url: `/api/v1/bookings/${created.json().booking_id}/cancel` });
    const res = await app.inject({ method: "GET", url: "/api/v1/courts/C1/availability?date=2026-11-21" });
    expect(res.json().find((s: { start_time: string }) => s.start_time === "18:00").status).toBe("DISPONIBLE");
  });

  it.each([
    ["una fecha pasada", "2026-11-19", 400, "PAST_DATE_TIME"],
    ["más de 30 días", "2026-12-22", 400, "MAX_ADVANCE_EXCEEDED"],
    ["un formato de fecha inválido", "20-11-2026", 422, "VALIDATION_ERROR"],
  ])("rechaza %s", async (_name, date, status, code) => {
    const res = await app.inject({ method: "GET", url: `/api/v1/courts/C1/availability?date=${date}` });
    expect(res.statusCode).toBe(status);
    expect(res.json().error.code).toBe(code);
  });

  it("responde 404 para una cancha inexistente", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/courts/C9/availability?date=2026-11-21" });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("COURT_NOT_FOUND");
  });
});
