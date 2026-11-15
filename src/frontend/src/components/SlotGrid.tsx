import type { AvailabilitySlot } from "@canchaya/shared";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  DISPONIBLE:
    "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-md dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
  OCUPADO:
    "cursor-not-allowed border-red-200 bg-red-50 text-red-800/70 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300/70",
  PASADO:
    "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
} as const;

const STATUS_LABEL = { DISPONIBLE: "Disponible", OCUPADO: "Ocupado", PASADO: "Ya pasó" } as const;

/** Grilla de turnos de 60 min (RF-02). Solo los turnos DISPONIBLE se pueden seleccionar. */
export function SlotGrid({ slots, onSelect }: { slots: AvailabilitySlot[]; onSelect: (slot: AvailabilitySlot) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {slots.map((slot) => (
        <li key={slot.start_time}>
          <button
            type="button"
            disabled={!slot.available}
            onClick={() => onSelect(slot)}
            aria-label={`${slot.start_time} a ${slot.end_time}: ${STATUS_LABEL[slot.status]}`}
            className={cn(
              "flex w-full flex-col items-start rounded-2xl border p-3.5 text-left transition",
              STATUS_STYLE[slot.status],
            )}
          >
            <span className={cn("text-lg font-bold tabular-nums", slot.status === "PASADO" && "line-through")}>
              {slot.start_time}
            </span>
            <span className="text-xs opacity-80">hasta {slot.end_time}</span>
            <span className="mt-2 text-xs font-semibold">{STATUS_LABEL[slot.status]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SlotLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
      {(["DISPONIBLE", "OCUPADO", "PASADO"] as const).map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded border", STATUS_STYLE[status])} />
          {STATUS_LABEL[status]}
        </span>
      ))}
    </div>
  );
}
