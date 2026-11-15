/**
 * Reloj inyectable (specs/architecture.md, sección 7).
 * El dominio nunca llama a `new Date()` directamente: recibe un Clock para que las reglas
 * de tiempo (BR-02 pasado, BR-05 ventana de 2 horas) se prueben de forma determinista.
 */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Reloj detenido en un instante fijo, para pruebas. */
export function fixedClock(instant: Date | string): Clock {
  const fixed = new Date(instant);
  if (Number.isNaN(fixed.getTime())) throw new Error(`Instante inválido: ${String(instant)}`);
  return { now: () => new Date(fixed) };
}
