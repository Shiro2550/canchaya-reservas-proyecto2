import { useEffect, useRef } from "react";
import { bookableDates, dayNumber, monthLabel, todayInComplex, weekdayLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Selector horizontal de fechas: de hoy a hoy + 30 días (BR-02). */
export function DateStrip({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const dates = bookableDates();
  const today = todayInComplex();
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="listbox" aria-label="Fecha del turno">
      {dates.map((date) => {
        const selected = date === value;
        return (
          <button
            key={date}
            ref={selected ? selectedRef : undefined}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(date)}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition",
              selected
                ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "border-slate-200 bg-white hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900",
            )}
          >
            <span className={cn("text-xs font-medium", !selected && "text-slate-500")}>
              {date === today ? "Hoy" : weekdayLabel(date)}
            </span>
            <span className="text-xl font-bold leading-tight">{dayNumber(date)}</span>
            <span className={cn("text-xs capitalize", !selected && "text-slate-500")}>{monthLabel(date)}</span>
          </button>
        );
      })}
    </div>
  );
}
