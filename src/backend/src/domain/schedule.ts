/**
 * Reglas temporales de BR-02 (fase 2 del orden de validación → HTTP 400).
 */
import {
  CLOSING_HOUR,
  ERROR_MESSAGES,
  MAX_ADVANCE_DAYS,
  OPENING_HOUR,
  SLOT_MINUTES,
} from "@canchaya/shared";
import { AppError } from "../shared/errors";
import { addDays, type LocalMoment } from "./time";

export const OPENING_MINUTES = OPENING_HOUR * 60;
export const CLOSING_MINUTES = CLOSING_HOUR * 60;

/** Inicios válidos de turno: 08:00, 09:00, …, 22:00 (el último termina a las 23:00). */
export function slotStarts(): number[] {
  const starts: number[] = [];
  for (let m = OPENING_MINUTES; m + SLOT_MINUTES <= CLOSING_MINUTES; m += SLOT_MINUTES) starts.push(m);
  return starts;
}

/**
 * Valida un turno solicitado. Orden dentro de la fase 2:
 * hora en punto → rango operativo → no en el pasado → máximo 30 días.
 */
export function assertBookableSlot(date: string, startMinutes: number, now: LocalMoment): void {
  if (startMinutes % SLOT_MINUTES !== 0) {
    throw new AppError("INVALID_TIME_SLOT", ERROR_MESSAGES.INVALID_TIME_SLOT);
  }
  if (startMinutes < OPENING_MINUTES || startMinutes + SLOT_MINUTES > CLOSING_MINUTES) {
    throw new AppError("OUT_OF_OPERATING_HOURS", ERROR_MESSAGES.OUT_OF_OPERATING_HOURS);
  }
  // N_start ≤ Now() se rechaza (BR-02).
  if (date < now.date || (date === now.date && startMinutes <= now.minutes)) {
    throw new AppError("PAST_DATE_TIME", ERROR_MESSAGES.PAST_DATE_TIME);
  }
  if (date > addDays(now.date, MAX_ADVANCE_DAYS)) {
    throw new AppError("MAX_ADVANCE_EXCEEDED", ERROR_MESSAGES.MAX_ADVANCE_EXCEEDED);
  }
}

/** Rango de fechas consultables en la grilla: de hoy a hoy + 30 días (business-rules 2.3). */
export function assertQueryableDate(date: string, now: LocalMoment): void {
  if (date < now.date) {
    throw new AppError("PAST_DATE_TIME", ERROR_MESSAGES.PAST_DATE_AVAILABILITY);
  }
  if (date > addDays(now.date, MAX_ADVANCE_DAYS)) {
    throw new AppError("MAX_ADVANCE_EXCEEDED", ERROR_MESSAGES.MAX_ADVANCE_AVAILABILITY);
  }
}
