/**
 * Regla anticolisión BR-01 (ADR-003), con el margen entre turnos como parámetro (BR-06).
 *
 *   Conflicto ⇔ N.start < E.end + buffer  ∧  N.end + buffer > E.start
 *
 * Intervalos semiabiertos [start, end) expresados en minutos del mismo día.
 * Que E esté CONFIRMADA lo filtra quien llama (consulta SQL o pruebas).
 */
export interface Interval {
  start: number;
  end: number;
}

export function overlaps(requested: Interval, existing: Interval, bufferMinutes = 0): boolean {
  return requested.start < existing.end + bufferMinutes && requested.end + bufferMinutes > existing.start;
}
