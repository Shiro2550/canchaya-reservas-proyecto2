import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { SPORT_LABELS, type AvailabilitySlot } from "@canchaya/shared";
import { BookingDialog } from "@/components/BookingDialog";
import { DateStrip } from "@/components/DateStrip";
import { ErrorState } from "@/components/ErrorState";
import { SlotGrid, SlotLegend } from "@/components/SlotGrid";
import { SPORT_STYLE } from "@/components/sport";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { useAvailability, useCourts } from "@/lib/api";
import { isBookableDate, longDateLabel, todayInComplex } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";

/** Grilla de disponibilidad de una cancha (US-01, RF-02) y apertura del formulario de reserva (US-02). */
export function CourtPage() {
  const { courtId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const requested = params.get("fecha") ?? "";
  const date = isBookableDate(requested) ? requested : todayInComplex();
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);

  const courts = useCourts();
  const court = courts.data?.find((c) => c.id === courtId);
  const availability = useAvailability(courtId, date);

  if (courts.isSuccess && !court) {
    return (
      <ErrorState
        title="Cancha no encontrada"
        message="La cancha que buscas no existe o no está disponible."
        action={
          <Button asChild>
            <Link to="/">Ver canchas</Link>
          </Button>
        }
      />
    );
  }

  const free = availability.data?.filter((s) => s.available).length ?? 0;

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="size-4" /> Todas las canchas
      </Link>

      {court ? (
        <header className={`flex items-center gap-4 rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg ${SPORT_STYLE[court.sport].gradient}`}>
          <span className="text-5xl drop-shadow" aria-hidden>
            {SPORT_STYLE[court.sport].emoji}
          </span>
          <div>
            <p className="text-sm font-medium text-white/80">{SPORT_LABELS[court.sport]}</p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{court.name}</h1>
            <p className="text-sm text-white/90">{formatMoney(court.hourly_rate)} por hora · turnos de 60 minutos</p>
          </div>
        </header>
      ) : (
        <Skeleton className="h-28" />
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">1. Elige el día</h2>
        <DateStrip value={date} onChange={(d) => setParams({ fecha: d }, { replace: true })} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">2. Elige el horario</h2>
            <p className="mt-1 text-lg font-semibold">{longDateLabel(date)}</p>
            {availability.isSuccess && (
              <p className="text-sm text-slate-500">
                {free === 0 ? "No quedan turnos libres este día." : `${free} turno${free === 1 ? "" : "s"} libre${free === 1 ? "" : "s"}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SlotLegend />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Actualizar horarios"
              onClick={() => availability.refetch()}
              disabled={availability.isFetching}
            >
              <RefreshCw className={availability.isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {availability.isPending && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 15 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}
        {availability.isError && (
          <ErrorState
            title="No pudimos cargar los horarios"
            message={availability.error.message}
            action={<Button onClick={() => availability.refetch()}>Reintentar</Button>}
          />
        )}
        {availability.isSuccess && <SlotGrid slots={availability.data} onSelect={setSelected} />}
      </section>

      {court && <BookingDialog court={court} date={date} slot={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
