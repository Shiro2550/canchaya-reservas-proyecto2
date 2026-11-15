/**
 * Conversión entre el instante real (UTC) y la hora local del complejo (ADR-007).
 * Fechas como `YYYY-MM-DD` y horas como minutos desde la medianoche local.
 */
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export interface LocalMoment {
  /** Fecha local `YYYY-MM-DD`. */
  date: string;
  /** Minutos transcurridos desde la medianoche local. */
  minutes: number;
}

export function toLocalMoment(instant: Date, timeZone: string): LocalMoment {
  const [date, hh, mm] = formatInTimeZone(instant, timeZone, "yyyy-MM-dd HH mm").split(" ");
  return { date: date!, minutes: Number(hh) * 60 + Number(mm) };
}

/** Instante UTC que corresponde a `fecha + minutos` en la zona del complejo. */
export function localToInstant(date: string, minutes: number, timeZone: string): Date {
  return fromZonedTime(`${date}T${minutesToTime(minutes)}:00`, timeZone);
}

/** `"18:30"` → 1110 */
export function timeToMinutes(time: string): number {
  const [hh, mm] = time.split(":").map(Number);
  return hh! * 60 + mm!;
}

/** 1110 → `"18:30"` */
export function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mm = (minutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Suma días de calendario a una fecha `YYYY-MM-DD`. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Representación que Prisma usa para columnas DATE (medianoche UTC). */
export function dateToDb(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

/** Representación que Prisma usa para columnas TIME (1970-01-01 en UTC). */
export function timeToDb(minutes: number): Date {
  return new Date(Date.UTC(1970, 0, 1, 0, minutes));
}

export function dateFromDb(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function minutesFromDb(value: Date): number {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}
