/**
 * Catálogo de errores de la API (specs/api.md, sección 3) y mensajes oficiales
 * (specs/business-rules.md y specs/acceptance-criteria.md).
 */

export const ERROR_CODES = {
  OUT_OF_OPERATING_HOURS: 400,
  INVALID_TIME_SLOT: 400,
  PAST_DATE_TIME: 400,
  MAX_ADVANCE_EXCEEDED: 400,
  LATE_CANCELLATION: 400,
  COURT_NOT_FOUND: 404,
  BOOKING_NOT_FOUND: 404,
  ROUTE_NOT_FOUND: 404,
  BOOKING_CONFLICT: 409,
  INVALID_STATE_TRANSITION: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const;
export type ErrorCode = keyof typeof ERROR_CODES;

export const ERROR_MESSAGES = {
  OUT_OF_OPERATING_HOURS: "El horario solicitado se encuentra fuera del rango operativo (08:00 - 23:00).",
  INVALID_TIME_SLOT: "El inicio del turno debe coincidir con una hora exacta (en punto).",
  PAST_DATE_TIME: "No se pueden agendar reservas en fechas u horas pasadas.",
  PAST_DATE_AVAILABILITY: "No se puede consultar la disponibilidad de fechas pasadas.",
  MAX_ADVANCE_EXCEEDED: "No se pueden realizar reservas con más de 30 días de anticipación.",
  MAX_ADVANCE_AVAILABILITY: "Solo se puede consultar la disponibilidad hasta 30 días de anticipación.",
  LATE_CANCELLATION: "No es posible cancelar la reserva: el plazo límite es de 2 horas previas al inicio del turno.",
  COURT_NOT_FOUND: "La cancha solicitada no existe o no está disponible.",
  BOOKING_NOT_FOUND: "No se encontró ninguna reserva asociada al código provisto.",
  BOOKING_CONFLICT: "La cancha solicitada no está disponible en el horario seleccionado.",
  INVALID_STATE_TRANSITION: "La reserva no puede cancelarse porque ya se encuentra cancelada o completada.",
  RATE_LIMITED: "Demasiados intentos. Espera un momento antes de volver a intentarlo.",
  INTERNAL_ERROR: "Ocurrió un error interno. Intenta de nuevo más tarde.",
} as const;
