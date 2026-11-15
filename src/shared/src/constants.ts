/**
 * Constantes del dominio. Fuente: specs/business-rules.md y specs/data-model.md.
 */

/** Zona horaria oficial del complejo (ADR-007). */
export const COMPLEX_TIMEZONE = "America/Panama";

/** Rango operativo y modularidad de turnos (BR-02). */
export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 23;
export const SLOT_MINUTES = 60;
export const MAX_ADVANCE_DAYS = 30;

/** Ventana mínima de cancelación (BR-05). */
export const CANCELLATION_WINDOW_MINUTES = 120;

/**
 * Margen entre turnos consecutivos de la misma cancha.
 * En la v1 es 0 (BR-01 tal como está); el cambio de requerimiento BR-06 (#5, #16) lo modificará.
 */
export const BOOKING_BUFFER_MINUTES = 0;

/** Deportes del catálogo (RF-01). */
export const SPORTS = ["FUTBOL_7", "PADEL", "TENIS", "BASQUETBOL"] as const;
export type Sport = (typeof SPORTS)[number];

export const SPORT_LABELS: Record<Sport, string> = {
  FUTBOL_7: "Fútbol 7",
  PADEL: "Pádel",
  TENIS: "Tenis",
  BASQUETBOL: "Básquetbol",
};

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

/** Validación de datos del cliente (BR-03). */
export const CUSTOMER_NAME_MIN = 3;
export const CUSTOMER_NAME_MAX = 80;
export const PHONE_DIGITS_MIN = 7;
export const PHONE_DIGITS_MAX = 15;
export const PHONE_MAX_LENGTH = 25;
export const EMAIL_MAX_LENGTH = 254;
