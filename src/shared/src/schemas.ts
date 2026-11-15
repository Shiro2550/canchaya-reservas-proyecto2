/**
 * Esquemas Zod del contrato REST (specs/api.md). Los usa el backend para validar
 * y el frontend para validar formularios con las mismas reglas.
 */
import { z } from "zod";
import {
  BOOKING_STATUSES,
  CUSTOMER_NAME_MAX,
  CUSTOMER_NAME_MIN,
  EMAIL_MAX_LENGTH,
  PHONE_DIGITS_MAX,
  PHONE_DIGITS_MIN,
  PHONE_MAX_LENGTH,
  SLOT_STATUSES,
  SPORTS,
} from "./constants";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_CHARS_REGEX = /^[0-9+\-\s()]+$/;

function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Fecha de calendario `YYYY-MM-DD` válida (no acepta 2026-02-30). */
export const dateSchema = z
  .string({ error: "La fecha es obligatoria." })
  .regex(DATE_REGEX, "La fecha debe tener el formato YYYY-MM-DD.")
  .refine(isRealDate, "La fecha no existe en el calendario.");

/** Hora `HH:mm` de 00:00 a 23:59. Que sea en punto y dentro del horario lo valida BR-02 (400). */
export const timeSchema = z
  .string({ error: "La hora de inicio es obligatoria." })
  .regex(TIME_REGEX, "La hora debe tener el formato HH:mm.");

export const customerNameSchema = z
  .string({ error: "El nombre es obligatorio." })
  .trim()
  .min(CUSTOMER_NAME_MIN, `El nombre debe tener entre ${CUSTOMER_NAME_MIN} y ${CUSTOMER_NAME_MAX} caracteres.`)
  .max(CUSTOMER_NAME_MAX, `El nombre debe tener entre ${CUSTOMER_NAME_MIN} y ${CUSTOMER_NAME_MAX} caracteres.`);

export const customerPhoneSchema = z
  .string({ error: "El teléfono es obligatorio." })
  .trim()
  .max(PHONE_MAX_LENGTH, `El teléfono no puede superar ${PHONE_MAX_LENGTH} caracteres.`)
  .regex(PHONE_CHARS_REGEX, "El teléfono solo puede contener dígitos, +, espacios, guiones y paréntesis.")
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= PHONE_DIGITS_MIN && digits <= PHONE_DIGITS_MAX;
    },
    `El teléfono debe contener entre ${PHONE_DIGITS_MIN} y ${PHONE_DIGITS_MAX} dígitos numéricos.`,
  );

export const customerEmailSchema = z
  .email({ error: "El correo electrónico no tiene un formato válido." })
  .max(EMAIL_MAX_LENGTH, "El correo electrónico es demasiado largo.");

export const courtIdSchema = z.string().min(1).max(10);

/** Cuerpo de POST /api/v1/bookings. `end_time` lo calcula el servidor (RF-03). */
export const createBookingRequestSchema = z.object({
  court_id: courtIdSchema,
  date: dateSchema,
  start_time: timeSchema,
  customer_name: customerNameSchema,
  customer_email: customerEmailSchema,
  customer_phone: customerPhoneSchema,
});
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;

export const bookingResponseSchema = z.object({
  booking_id: z.string(),
  court_id: z.string(),
  court_name: z.string(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  customer_name: z.string(),
  customer_email: z.string(),
  customer_phone: z.string(),
  status: z.enum(BOOKING_STATUSES),
  created_at: z.string(),
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;

export const courtResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  sport: z.enum(SPORTS),
  hourly_rate: z.string(),
});
export type CourtResponse = z.infer<typeof courtResponseSchema>;

export const availabilitySlotSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(SLOT_STATUSES),
  available: z.boolean(),
});
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

export const availabilityQuerySchema = z.object({ date: dateSchema });

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
