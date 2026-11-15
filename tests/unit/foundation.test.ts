import { describe, expect, it } from "vitest";
import {
  BOOKING_CODE_ALPHABET,
  BOOKING_CODE_REGEX,
  ERROR_CODES,
} from "@canchaya/shared";
import { fixedClock } from "../../src/backend/src/domain/clock";
import { AppError } from "../../src/backend/src/shared/errors";

describe("Reloj inyectable", () => {
  it("devuelve siempre el mismo instante y una copia nueva cada vez", () => {
    const clock = fixedClock("2026-11-20T19:00:00.000Z");
    const a = clock.now();
    const b = clock.now();
    expect(a.toISOString()).toBe("2026-11-20T19:00:00.000Z");
    expect(a).not.toBe(b);
  });

  it("rechaza instantes inválidos", () => {
    expect(() => fixedClock("no-es-fecha")).toThrow();
  });
});

describe("Formato del código de reserva (BR-03)", () => {
  it("el alfabeto tiene 32 caracteres y excluye 0, O, 1 e I", () => {
    expect(BOOKING_CODE_ALPHABET).toHaveLength(32);
    expect(new Set(BOOKING_CODE_ALPHABET).size).toBe(32);
    for (const ambiguous of ["0", "O", "1", "I"]) expect(BOOKING_CODE_ALPHABET).not.toContain(ambiguous);
  });

  it.each(["CY-7K3M9QXA", "CY-8M2K3L9Q", "CY-EX7STNT2", "CY-ZZZZZZZZ"])("acepta %s", (code) => {
    expect(BOOKING_CODE_REGEX.test(code)).toBe(true);
  });

  it.each(["CY-8M2K1L90", "cy-7k3m9qxa", "CY-2026-X89J", "abc", "CY-7K3M9QX"])("rechaza %s", (code) => {
    expect(BOOKING_CODE_REGEX.test(code)).toBe(false);
  });

  it("la expresión acepta exactamente los caracteres del alfabeto", () => {
    for (const ch of BOOKING_CODE_ALPHABET) expect(BOOKING_CODE_REGEX.test(`CY-${ch.repeat(8)}`)).toBe(true);
  });
});

describe("AppError", () => {
  it("toma el status HTTP del catálogo de errores", () => {
    const err = new AppError("BOOKING_CONFLICT", "La cancha solicitada no está disponible en el horario seleccionado.");
    expect(err.statusCode).toBe(409);
    expect(ERROR_CODES.LATE_CANCELLATION).toBe(400);
    expect(ERROR_CODES.VALIDATION_ERROR).toBe(422);
  });
});
