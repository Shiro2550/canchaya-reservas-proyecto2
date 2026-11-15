/**
 * Reglas puras de dominio: horario (BR-02), estado perezoso (ADR-007), cancelación (BR-04/BR-05)
 * y generación del código (BR-03).
 */
import { describe, expect, it } from "vitest";
import { BOOKING_CODE_REGEX } from "@canchaya/shared";
import { generateBookingCode } from "../../src/backend/src/domain/booking-code";
import { assertCancellable, effectiveStatus } from "../../src/backend/src/domain/booking-rules";
import { assertBookableSlot, assertQueryableDate, slotStarts } from "../../src/backend/src/domain/schedule";
import { localToInstant, toLocalMoment } from "../../src/backend/src/domain/time";

const TZ = "America/Panama";
const now = { date: "2026-11-20", minutes: 14 * 60 }; // 14:00 en Panamá

function codeOf(fn: () => void): string | undefined {
  try {
    fn();
    return undefined;
  } catch (e) {
    return (e as { code?: string }).code;
  }
}

describe("Zona horaria del complejo (ADR-007)", () => {
  it("19:00 UTC son las 14:00 en Panamá", () => {
    expect(toLocalMoment(new Date("2026-11-20T19:00:00Z"), TZ)).toEqual(now);
  });

  it("las 18:00 del 2026-11-20 en Panamá son las 23:00 UTC", () => {
    expect(localToInstant("2026-11-20", 18 * 60, TZ).toISOString()).toBe("2026-11-20T23:00:00.000Z");
  });
});

describe("Turnos válidos (BR-02)", () => {
  it("hay 15 turnos: de 08:00 a 22:00", () => {
    const starts = slotStarts();
    expect(starts).toHaveLength(15);
    expect(starts[0]).toBe(8 * 60);
    expect(starts.at(-1)).toBe(22 * 60);
  });

  it.each([
    ["17:30 no es hora exacta", "2026-11-20", 17 * 60 + 30, "INVALID_TIME_SLOT"],
    ["06:00 es antes de la apertura", "2026-11-21", 6 * 60, "OUT_OF_OPERATING_HOURS"],
    ["23:00 termina después del cierre", "2026-11-21", 23 * 60, "OUT_OF_OPERATING_HOURS"],
    ["ayer está en el pasado", "2026-11-19", 18 * 60, "PAST_DATE_TIME"],
    ["hoy a las 14:00 ya empezó (N_start ≤ Now)", "2026-11-20", 14 * 60, "PAST_DATE_TIME"],
    ["a 31 días supera el límite", "2026-12-21", 10 * 60, "MAX_ADVANCE_EXCEEDED"],
  ])("rechaza: %s", (_name, date, minutes, code) => {
    expect(codeOf(() => assertBookableSlot(date, minutes, now))).toBe(code);
  });

  it.each([
    ["hoy a las 15:00", "2026-11-20", 15 * 60],
    ["el último turno 22:00", "2026-11-21", 22 * 60],
    ["exactamente a 30 días", "2026-12-20", 10 * 60],
  ])("acepta: %s", (_name, date, minutes) => {
    expect(codeOf(() => assertBookableSlot(date, minutes, now))).toBeUndefined();
  });

  it("la grilla acepta de hoy a hoy + 30 días", () => {
    expect(codeOf(() => assertQueryableDate("2026-11-20", now))).toBeUndefined();
    expect(codeOf(() => assertQueryableDate("2026-12-20", now))).toBeUndefined();
    expect(codeOf(() => assertQueryableDate("2026-11-19", now))).toBe("PAST_DATE_TIME");
    expect(codeOf(() => assertQueryableDate("2026-12-22", now))).toBe("MAX_ADVANCE_EXCEEDED");
  });
});

describe("Estado efectivo y cancelación (BR-04, BR-05)", () => {
  const booking = { status: "CONFIRMADA" as const, date: "2026-11-20", startMinutes: 18 * 60, endMinutes: 19 * 60 };
  const at = (iso: string) => new Date(iso);

  it("una reserva CONFIRMADA cuya hora de fin pasó se expone como COMPLETADA", () => {
    expect(effectiveStatus(booking, at("2026-11-21T00:00:00Z"), TZ)).toBe("COMPLETADA"); // 19:00 Panamá
    expect(effectiveStatus(booking, at("2026-11-20T23:59:00Z"), TZ)).toBe("CONFIRMADA"); // 18:59 Panamá
  });

  it("permite cancelar con 4 horas de anticipación y con exactamente 2 horas", () => {
    expect(codeOf(() => assertCancellable(booking, at("2026-11-20T19:00:00Z"), TZ))).toBeUndefined();
    expect(codeOf(() => assertCancellable(booking, at("2026-11-20T21:00:00Z"), TZ))).toBeUndefined();
  });

  it("rechaza cancelar con 45 minutos de anticipación (LATE_CANCELLATION)", () => {
    expect(codeOf(() => assertCancellable(booking, at("2026-11-20T22:15:00Z"), TZ))).toBe("LATE_CANCELLATION");
  });

  it("una reserva ya CANCELADA responde 409 aunque falten menos de 2 horas", () => {
    const cancelled = { ...booking, status: "CANCELADA" as const };
    expect(codeOf(() => assertCancellable(cancelled, at("2026-11-20T22:15:00Z"), TZ))).toBe("INVALID_STATE_TRANSITION");
  });

  it("una reserva COMPLETADA no se puede cancelar", () => {
    expect(codeOf(() => assertCancellable(booking, at("2026-11-21T01:00:00Z"), TZ))).toBe("INVALID_STATE_TRANSITION");
  });
});

describe("Código de reserva (BR-03)", () => {
  it("genera códigos con el formato oficial", () => {
    for (let i = 0; i < 500; i++) expect(generateBookingCode()).toMatch(BOOKING_CODE_REGEX);
  });

  it("usa el generador recibido (determinista en pruebas)", () => {
    expect(generateBookingCode(() => 0)).toBe("CY-22222222");
    expect(generateBookingCode((max) => max - 1)).toBe("CY-ZZZZZZZZ");
  });
});
