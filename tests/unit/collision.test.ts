/**
 * BR-01 a nivel de dominio: los 5 casos teóricos de solapamiento (business-rules.md)
 * con intervalos semiabiertos [start, end) en minutos.
 */
import { describe, expect, it } from "vitest";
import { overlaps } from "../../src/backend/src/domain/collision";

const h = (hh: number, mm = 0) => hh * 60 + mm;
const existing = { start: h(18), end: h(19) }; // reserva confirmada de 18:00 a 19:00

describe("overlaps() — casos de conflicto de BR-01", () => {
  it.each([
    ["1. idéntico", { start: h(18), end: h(19) }],
    ["2. interno", { start: h(18, 15), end: h(18, 45) }],
    ["3. envolvente", { start: h(17), end: h(20) }],
    ["4. por inicio", { start: h(17, 30), end: h(18, 30) }],
    ["5. por fin", { start: h(18, 30), end: h(19, 30) }],
  ])("detecta el solapamiento %s", (_name, requested) => {
    expect(overlaps(requested, existing)).toBe(true);
  });
});

describe("overlaps() — sin conflicto", () => {
  it("permite el turno contiguo posterior (19:00–20:00): el intervalo es semiabierto", () => {
    expect(overlaps({ start: h(19), end: h(20) }, existing)).toBe(false);
  });

  it("permite el turno contiguo anterior (17:00–18:00)", () => {
    expect(overlaps({ start: h(17), end: h(18) }, existing)).toBe(false);
  });

  it("permite turnos lejanos", () => {
    expect(overlaps({ start: h(8), end: h(9) }, existing)).toBe(false);
  });
});

describe("overlaps() — margen entre turnos (preparado para BR-06)", () => {
  it("con margen de 15 min, el turno contiguo pasa a ser conflicto", () => {
    expect(overlaps({ start: h(19), end: h(20) }, existing, 15)).toBe(true);
    expect(overlaps({ start: h(17), end: h(18) }, existing, 15)).toBe(true);
  });

  it("con margen de 15 min, un turno que deja 15 min libres no choca", () => {
    expect(overlaps({ start: h(19, 15), end: h(20, 15) }, existing, 15)).toBe(false);
  });
});
