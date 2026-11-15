import { ERROR_MESSAGES, SLOT_MINUTES, type AvailabilitySlot, type CourtResponse } from "@canchaya/shared";
import type { PrismaClient } from "../../db/client";
import type { Clock } from "../../domain/clock";
import { assertQueryableDate, slotStarts } from "../../domain/schedule";
import { dateToDb, minutesFromDb, minutesToTime, toLocalMoment } from "../../domain/time";
import { AppError } from "../../shared/errors";

export class CourtsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly clock: Clock,
    private readonly timeZone: string,
  ) {}

  /** RF-01: catálogo de canchas activas. */
  async listActive(): Promise<CourtResponse[]> {
    const courts = await this.prisma.court.findMany({ where: { isActive: true }, orderBy: { id: "asc" } });
    return courts.map((c) => ({ id: c.id, name: c.name, sport: c.sport, hourly_rate: c.hourlyRate.toFixed(2) }));
  }

  /**
   * RF-02: grilla de slots de 60 min para una fecha (business-rules.md 2.3).
   * Orden: formato (422, en la ruta) → rango de fechas (400) → cancha existente (404).
   */
  async availability(courtId: string, date: string): Promise<AvailabilitySlot[]> {
    const now = toLocalMoment(this.clock.now(), this.timeZone);
    assertQueryableDate(date, now);

    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court?.isActive) throw new AppError("COURT_NOT_FOUND", ERROR_MESSAGES.COURT_NOT_FOUND);

    const confirmed = await this.prisma.booking.findMany({
      where: { courtId, bookingDate: dateToDb(date), status: "CONFIRMADA" },
      select: { startTime: true, endTime: true },
    });
    const taken = confirmed.map((b) => ({ start: minutesFromDb(b.startTime), end: minutesFromDb(b.endTime) }));

    return slotStarts().map((start) => {
      const end = start + SLOT_MINUTES;
      const isPast = date === now.date && start <= now.minutes;
      const isTaken = taken.some((t) => start < t.end && end > t.start);
      const status = isPast ? "PASADO" : isTaken ? "OCUPADO" : "DISPONIBLE";
      return { start_time: minutesToTime(start), end_time: minutesToTime(end), status, available: status === "DISPONIBLE" };
    });
  }
}
