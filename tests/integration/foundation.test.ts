/**
 * Pruebas de humo del andamiaje (issue #27): la API arranca, responde con el formato de error
 * acordado y la base de datos guarda fechas, horas y marcas de tiempo como define data-model.md.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/backend/src/app";
import { fixedClock } from "../../src/backend/src/domain/clock";
import type { PrismaClient } from "../../src/backend/src/db/client";
import { createTestPrisma, resetDatabase } from "../helpers/db";

let prisma: PrismaClient;
let app: FastifyInstance;

beforeAll(async () => {
  prisma = createTestPrisma();
  app = await buildApp({ prisma, clock: fixedClock("2026-11-20T19:00:00.000Z") });
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

const baseBooking = {
  courtId: "C1",
  bookingDate: new Date("2026-11-20T00:00:00.000Z"),
  startTime: new Date("1970-01-01T18:00:00.000Z"),
  endTime: new Date("1970-01-01T19:00:00.000Z"),
  customerName: "Carlos Méndez",
  customerPhone: "+507 6123-4567",
  customerEmail: "carlos@example.com",
};

describe("API base", () => {
  it("GET /api/v1/health responde ok con la base de datos disponible", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", database: "ok", time: "2026-11-20T19:00:00.000Z" });
  });

  it("una ruta inexistente responde 404 con el formato único de error", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/no-existe" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: { code: "ROUTE_NOT_FOUND", message: "La ruta GET /api/v1/no-existe no existe." },
    });
  });
});

describe("Base de datos (specs/data-model.md)", () => {
  it("guarda fecha y hora del turno sin desplazamientos de zona horaria", async () => {
    await prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-7K3M9QXA" } });

    const [row] = await prisma.$queryRaw<{ d: string; s: string; e: string; slot: number }[]>`
      SELECT CAST(booking_date AS CHAR) AS d, CAST(start_time AS CHAR) AS s,
             CAST(end_time AS CHAR) AS e, active_slot AS slot
      FROM bookings WHERE booking_code = 'CY-7K3M9QXA'`;
    expect(row).toEqual({ d: "2026-11-20", s: "18:00:00", e: "19:00:00", slot: 1 });

    const read = await prisma.booking.findUniqueOrThrow({ where: { bookingCode: "CY-7K3M9QXA" } });
    expect(read.bookingDate.toISOString()).toBe("2026-11-20T00:00:00.000Z");
    expect(read.startTime.toISOString()).toBe("1970-01-01T18:00:00.000Z");
    expect(read.status).toBe("CONFIRMADA");
  });

  it("guarda created_at en UTC", async () => {
    const before = Date.now();
    const created = await prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-8M2K3L9Q" } });
    const after = Date.now();
    expect(created.createdAt.getTime()).toBeGreaterThanOrEqual(before - 2_000);
    expect(created.createdAt.getTime()).toBeLessThanOrEqual(after + 2_000);

    const [row] = await prisma.$queryRaw<{ diff: bigint | number }[]>`
      SELECT ABS(TIMESTAMPDIFF(SECOND, created_at, UTC_TIMESTAMP(3))) AS diff
      FROM bookings WHERE booking_code = 'CY-8M2K3L9Q'`;
    expect(Number(row?.diff)).toBeLessThan(5);
  });

  it("el índice único impide dos reservas CONFIRMADA en el mismo turno (BR-01)", async () => {
    await prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-7K3M9QXA" } });
    await expect(
      prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-8M2K3L9Q" } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("una reserva CANCELADA libera el turno (excepción de BR-01)", async () => {
    await prisma.booking.create({
      data: { ...baseBooking, bookingCode: "CY-EX7STNT2", status: "CANCELADA", cancelledAt: new Date() },
    });
    const again = await prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-9N4P2Q8R" } });
    expect(again.status).toBe("CONFIRMADA");
  });

  it("la base rechaza códigos fuera del formato aunque la aplicación fallara", async () => {
    await expect(
      prisma.booking.create({ data: { ...baseBooking, bookingCode: "CY-8M2K1L90" } }),
    ).rejects.toThrow(/chk_bookings_code/);
  });
});
