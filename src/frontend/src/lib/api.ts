/**
 * Cliente de la API REST (specs/api.md) y hooks de TanStack Query.
 * Las respuestas se validan con los mismos esquemas Zod que usa el backend.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  availabilitySlotSchema,
  bookingResponseSchema,
  courtResponseSchema,
  errorResponseSchema,
  type BookingResponse,
  type CreateBookingRequest,
} from "@canchaya/shared";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: { method?: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method: init?.method ?? "GET",
      // Solo se envía Content-Type cuando hay cuerpo: Fastify rechaza JSON vacío.
      ...(init?.body !== undefined && {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(init.body),
      }),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    throw parsed.success
      ? new ApiError(res.status, parsed.data.error.code, parsed.data.error.message)
      : new ApiError(res.status, "INTERNAL_ERROR", "Ocurrió un error inesperado. Intenta de nuevo.");
  }
  return schema.parse(body);
}

export const api = {
  courts: () => request("/courts", z.array(courtResponseSchema)),
  availability: (courtId: string, date: string) =>
    request(`/courts/${encodeURIComponent(courtId)}/availability?date=${date}`, z.array(availabilitySlotSchema)),
  booking: (code: string) => request(`/bookings/${encodeURIComponent(code)}`, bookingResponseSchema),
  createBooking: (input: CreateBookingRequest) =>
    request("/bookings", bookingResponseSchema, { method: "POST", body: input }),
  cancelBooking: (code: string) =>
    request(`/bookings/${encodeURIComponent(code)}/cancel`, bookingResponseSchema, { method: "POST" }),
};

export const queryKeys = {
  courts: ["courts"] as const,
  availability: (courtId: string, date: string) => ["availability", courtId, date] as const,
  booking: (code: string) => ["booking", code] as const,
};

export function useCourts() {
  return useQuery({ queryKey: queryKeys.courts, queryFn: api.courts, staleTime: 5 * 60_000 });
}

/** La grilla se refresca sola cada 30 s y al volver a la pestaña (OC-04: disponibilidad en tiempo real). */
export function useAvailability(courtId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.availability(courtId, date),
    queryFn: () => api.availability(courtId, date),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useBooking(code: string) {
  return useQuery({
    queryKey: queryKeys.booking(code),
    queryFn: () => api.booking(code),
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
  });
}

export function useCreateBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.createBooking,
    onSuccess: (booking) => {
      client.setQueryData(queryKeys.booking(booking.booking_id), booking);
      void client.invalidateQueries({ queryKey: queryKeys.availability(booking.court_id, booking.date) });
    },
    onError: (_error, input) => {
      void client.invalidateQueries({ queryKey: queryKeys.availability(input.court_id, input.date) });
    },
  });
}

export function useCancelBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.cancelBooking,
    onSuccess: (booking: BookingResponse) => {
      client.setQueryData(queryKeys.booking(booking.booking_id), booking);
      void client.invalidateQueries({ queryKey: queryKeys.availability(booking.court_id, booking.date) });
    },
    onError: (_error, code) => {
      void client.invalidateQueries({ queryKey: queryKeys.booking(code) });
    },
  });
}
