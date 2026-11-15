import {
  BOOKING_BUFFER_MINUTES,
  BOOKING_CODE_REGEX,
  ERROR_MESSAGES,
  SLOT_MINUTES,
  type BookingResponse,
  type CreateBookingRequest,
} from "@canchaya/shared";
import type { PrismaClient } from "../../db/client";
import { violatedUniqueIndex } from "../../db/errors";
import { Prisma, type Booking } from "../../generated/prisma/client";
import { generateBookingCode } from "../../domain/booking-code";
import { assertCancellable, effectiveStatus, type StoredBooking } from "../../domain/booking-rules";
import type { Clock } from "../../domain/clock";
import { assertBookableSlot } from "../../domain/schedule";
import {
  dateFromDb,
  dateToDb,
  minutesFromDb,
  minutesToTime,
  timeToDb,
  timeToMinutes,
  toLocalMoment,
} from "../../domain/time";
import { AppError } from "../../shared/errors";

type BookingWithCourt = Booking & { court: { name: string } };

const MAX_CODE_ATTEMPTS = 5;

export class BookingsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly clock: Clock,
    private readonly timeZone: string,
    private readonly newCode: () => string = generateBookingCode,
  ) {}

  /**
   * POST /bookings. El formato (422) ya lo validó la ruta. Aquí:
   * reglas de horario (400) → cancha (404) → colisión BR-01 (409), con las dos barreras
   * de specs/architecture.md §5: bloqueo de la cancha + índice único.
   */
  async create(input: CreateBookingRequest): Promise<BookingResponse> {
    const now = toLocalMoment(this.clock.now(), this.timeZone);
    const start = timeToMinutes(input.start_time);
    const end = start + SLOT_MINUTES;
    assertBookableSlot(input.date, start, now);

    for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
      try {
        const booking = await this.prisma.$transaction(
          async (tx) => {
            // Barrera principal: las reservas de la misma cancha se procesan de a una.
            const courts = await tx.$queryRaw<{ id: string; is_active: number }[]>`
              SELECT id, is_active FROM courts WHERE id = ${input.court_id} FOR UPDATE`;
            if (!courts[0]?.is_active) throw new AppError("COURT_NOT_FOUND", ERROR_MESSAGES.COURT_NOT_FOUND);

            // Fórmula BR-01 sobre reservas CONFIRMADAS, con el margen de BR-06 como parámetro.
            const clashes = await tx.$queryRaw<{ id: bigint }[]>`
              SELECT id FROM bookings
              WHERE court_id = ${input.court_id}
                AND booking_date = ${input.date}
                AND status = 'CONFIRMADA'
                AND ${start * 60} < TIME_TO_SEC(end_time) + ${BOOKING_BUFFER_MINUTES * 60}
                AND ${end * 60} + ${BOOKING_BUFFER_MINUTES * 60} > TIME_TO_SEC(start_time)
              LIMIT 1`;
            if (clashes.length > 0) throw new AppError("BOOKING_CONFLICT", ERROR_MESSAGES.BOOKING_CONFLICT);

            const created = await tx.booking.create({
              data: {
                bookingCode: this.newCode(),
                courtId: input.court_id,
                bookingDate: dateToDb(input.date),
                startTime: timeToDb(start),
                endTime: timeToDb(end),
                customerName: input.customer_name,
                customerPhone: input.customer_phone,
                customerEmail: input.customer_email,
              },
              include: { court: { select: { name: true } } },
            });
            await tx.bookingEvent.create({ data: { bookingId: created.id, eventType: "CREATED" } });
            return created;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
        );
        return this.toResponse(booking);
      } catch (error) {
        const index = violatedUniqueIndex(error);
        // Barrera de respaldo: el índice único detectó la doble reserva.
        if (index === "uq_bookings_active_slot") {
          throw new AppError("BOOKING_CONFLICT", ERROR_MESSAGES.BOOKING_CONFLICT);
        }
        // Código repetido (muy improbable): se genera otro y se reintenta.
        if (index === "uq_bookings_code" && attempt < MAX_CODE_ATTEMPTS) continue;
        throw error;
      }
    }
    throw new Error("No se pudo generar un código de reserva único");
  }

  /** GET /bookings/{code}. Un código mal formado responde igual que uno inexistente (2.4). */
  async findByCode(code: string): Promise<BookingResponse> {
    return this.toResponse(await this.load(code));
  }

  /** POST /bookings/{code}/cancel. Orden: 404 → 409 → 400 (business-rules.md 2.2). */
  async cancel(code: string): Promise<BookingResponse> {
    const booking = await this.load(code);
    const now = this.clock.now();
    assertCancellable(this.toStored(booking), now, this.timeZone);

    const updated = await this.prisma.$transaction(async (tx) => {
      // Condición sobre el estado: si otra petición la canceló en paralelo, no se cancela dos veces.
      const { count } = await tx.booking.updateMany({
        where: { id: booking.id, status: "CONFIRMADA" },
        data: { status: "CANCELADA", cancelledAt: now },
      });
      if (count === 0) throw new AppError("INVALID_STATE_TRANSITION", ERROR_MESSAGES.INVALID_STATE_TRANSITION);
      await tx.bookingEvent.create({
        data: { bookingId: booking.id, eventType: "CANCELLED", details: { previous_status: "CONFIRMADA" } },
      });
      return tx.booking.findUniqueOrThrow({ where: { id: booking.id }, include: { court: { select: { name: true } } } });
    });
    return this.toResponse(updated);
  }

  private async load(code: string): Promise<BookingWithCourt> {
    const normalized = code.trim();
    const booking = BOOKING_CODE_REGEX.test(normalized)
      ? await this.prisma.booking.findUnique({
          where: { bookingCode: normalized },
          include: { court: { select: { name: true } } },
        })
      : null;
    if (!booking) throw new AppError("BOOKING_NOT_FOUND", ERROR_MESSAGES.BOOKING_NOT_FOUND);
    return booking;
  }

  private toStored(b: Booking): StoredBooking {
    return {
      status: b.status,
      date: dateFromDb(b.bookingDate),
      startMinutes: minutesFromDb(b.startTime),
      endMinutes: minutesFromDb(b.endTime),
    };
  }

  private toResponse(b: BookingWithCourt): BookingResponse {
    const stored = this.toStored(b);
    return {
      booking_id: b.bookingCode,
      court_id: b.courtId,
      court_name: b.court.name,
      date: stored.date,
      start_time: minutesToTime(stored.startMinutes),
      end_time: minutesToTime(stored.endMinutes),
      customer_name: b.customerName,
      customer_email: b.customerEmail,
      customer_phone: b.customerPhone,
      status: effectiveStatus(stored, this.clock.now(), this.timeZone),
      created_at: b.createdAt.toISOString(),
    };
  }
}
