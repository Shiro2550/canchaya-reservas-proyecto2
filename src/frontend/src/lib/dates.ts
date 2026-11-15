/**
 * Fechas en la hora del complejo (America/Panama, UTC−5 todo el año: no tiene horario de verano).
 * El navegador del cliente puede estar en otra zona horaria; la grilla siempre usa la del complejo.
 */
import { CANCELLATION_WINDOW_MINUTES, COMPLEX_TIMEZONE, MAX_ADVANCE_DAYS } from "@canchaya/shared";

const PANAMA_OFFSET = "-05:00";

const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: COMPLEX_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Fecha de hoy en Panamá, `YYYY-MM-DD`. */
export function todayInComplex(now = new Date()): string {
  return isoDate.format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Fechas reservables: de hoy a hoy + 30 días (BR-02). */
export function bookableDates(now = new Date()): string[] {
  const today = todayInComplex(now);
  return Array.from({ length: MAX_ADVANCE_DAYS + 1 }, (_, i) => addDays(today, i));
}

export function isBookableDate(date: string, now = new Date()): boolean {
  const today = todayInComplex(now);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today && date <= addDays(today, MAX_ADVANCE_DAYS);
}

const dayFmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-PA", { ...opts, timeZone: "UTC" });
const weekdayShort = dayFmt({ weekday: "short" });
const monthShort = dayFmt({ month: "short" });
const longDate = dayFmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });

const at = (date: string) => new Date(`${date}T12:00:00Z`);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function weekdayLabel(date: string): string {
  return capitalize(weekdayShort.format(at(date)).replace(".", ""));
}

export function monthLabel(date: string): string {
  return monthShort.format(at(date)).replace(".", "");
}

export function dayNumber(date: string): number {
  return at(date).getUTCDate();
}

/** "viernes, 20 de noviembre de 2026" → "Viernes, 20 de noviembre de 2026" */
export function longDateLabel(date: string): string {
  return capitalize(longDate.format(at(date)));
}

/** Minutos que faltan para el inicio del turno, calculados en hora de Panamá. */
export function minutesUntil(date: string, time: string, now = new Date()): number {
  return (Date.parse(`${date}T${time}:00${PANAMA_OFFSET}`) - now.getTime()) / 60_000;
}

/** Regla BR-05 vista desde el cliente (el servidor decide de todos modos). */
export function canStillCancel(date: string, startTime: string, now = new Date()): boolean {
  return minutesUntil(date, startTime, now) >= CANCELLATION_WINDOW_MINUTES;
}
