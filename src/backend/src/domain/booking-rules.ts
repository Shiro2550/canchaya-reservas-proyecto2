/**
 * Estado efectivo (evaluación perezosa, ADR-007) y reglas de cancelación (BR-04, BR-05).
 */
import { CANCELLATION_WINDOW_MINUTES, ERROR_MESSAGES, type BookingStatus } from "@canchaya/shared";
import { AppError } from "../shared/errors";
import { localToInstant } from "./time";

export interface StoredBooking {
  status: BookingStatus;
  date: string;
  startMinutes: number;
  endMinutes: number;
}

/** Una reserva CONFIRMADA cuya hora de fin ya pasó se expone como COMPLETADA, sin escribir en la base. */
export function effectiveStatus(booking: StoredBooking, now: Date, timeZone: string): BookingStatus {
  if (booking.status !== "CONFIRMADA") return booking.status;
  const end = localToInstant(booking.date, booking.endMinutes, timeZone);
  return end.getTime() <= now.getTime() ? "COMPLETADA" : "CONFIRMADA";
}

/**
 * Cancelación: después de comprobar que existe (404), el orden es
 * estado terminal (409) → ventana de 2 horas (400). business-rules.md, sección 2.2.
 */
export function assertCancellable(booking: StoredBooking, now: Date, timeZone: string): void {
  if (effectiveStatus(booking, now, timeZone) !== "CONFIRMADA") {
    throw new AppError("INVALID_STATE_TRANSITION", ERROR_MESSAGES.INVALID_STATE_TRANSITION);
  }
  const start = localToInstant(booking.date, booking.startMinutes, timeZone);
  const minutesUntilStart = (start.getTime() - now.getTime()) / 60_000;
  if (minutesUntilStart < CANCELLATION_WINDOW_MINUTES) {
    throw new AppError("LATE_CANCELLATION", ERROR_MESSAGES.LATE_CANCELLATION);
  }
}
