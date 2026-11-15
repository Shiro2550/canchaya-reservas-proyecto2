/**
 * Constantes del dominio y contrato de errores compartidos entre backend y frontend.
 * Fuente: specs/business-rules.md, specs/api.md y specs/data-model.md.
 */
import { z } from "zod";

/** Zona horaria oficial del complejo (ADR-007). */
export const COMPLEX_TIMEZONE = "America/Panama";

/** Rango operativo y modularidad de turnos (BR-02). */
export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 23;
export const SLOT_MINUTES = 60;
export const MAX_ADVANCE_DAYS = 30;

/** Ventana mínima de cancelación (BR-05). */
export const CANCELLATION_WINDOW_MINUTES = 120;

/** Deportes del catálogo (RF-01). */
export const SPORTS = ["FUTBOL_7", "PADEL", "TENIS", "BASQUETBOL"] as const;
export type Sport = (typeof SPORTS)[number];

/** Estados canónicos de la reserva (BR-04, ADR-007). */
export const BOOKING_STATUSES = ["CONFIRMADA", "CANCELADA", "COMPLETADA"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Estados de un slot en la grilla de disponibilidad (RF-02). */
export const SLOT_STATUSES = ["DISPONIBLE", "OCUPADO", "PASADO"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

/** Código de reserva: `CY-` + 8 caracteres sin ambigüedades (BR-03, ADR-002). */
export const BOOKING_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const BOOKING_CODE_LENGTH = 8;
export const BOOKING_CODE_PREFIX = "CY-";
export const BOOKING_CODE_REGEX = /^CY-[2-9A-HJ-NP-Z]{8}$/;

/** Catálogo de códigos de error (specs/api.md, sección 3). */
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

/** Formato único de error de la API. */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/** Respuesta del endpoint de salud. */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  database: z.enum(["ok", "down"]),
  time: z.string(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
