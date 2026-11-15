import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ShieldCheck, Ticket, Zap } from "lucide-react";
import { SPORT_LABELS, SPORTS, type Sport } from "@canchaya/shared";
import { CourtCard } from "@/components/CourtCard";
import { ErrorState } from "@/components/ErrorState";
import { SPORT_STYLE } from "@/components/sport";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { useCourts } from "@/lib/api";
import { cn } from "@/lib/utils";

const benefits = [
  { icon: Zap, title: "En menos de un minuto", text: "Solo nombre, teléfono y correo. Sin contraseñas." },
  { icon: ShieldCheck, title: "Cero doble reserva", text: "Si el turno es tuyo, nadie más puede tomarlo." },
  { icon: Ticket, title: "Tu código, tu control", text: "Consulta o cancela cuando quieras con tu código." },
];

/** Catálogo de canchas con filtro por deporte (US-01, RF-01). */
export function HomePage() {
  const courts = useCourts();
  const [sport, setSport] = useState<Sport | "TODOS">("TODOS");
  const visible = courts.data?.filter((c) => sport === "TODOS" || c.sport === sport) ?? [];

  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
            Reserva sin crear cuenta
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Tu cancha lista en <span className="text-brand-600 dark:text-brand-400">segundos</span>.
          </h1>
          <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Elige deporte, mira los horarios libres en tiempo real y aparta tu turno. Te damos un código para consultar o
            cancelar cuando quieras.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#canchas">Ver canchas</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/mi-reserva">Ya tengo un código</Link>
            </Button>
          </div>
        </motion.div>

        <ul className="grid gap-3">
          {benefits.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      <section id="canchas" className="scroll-mt-24 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Canchas disponibles</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por deporte">
            {(["TODOS", ...SPORTS] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sport === s}
                onClick={() => setSport(s)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                  sport === s
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900",
                )}
              >
                {s === "TODOS" ? "Todos" : `${SPORT_STYLE[s].emoji} ${SPORT_LABELS[s]}`}
              </button>
            ))}
          </div>
        </div>

        {courts.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        )}
        {courts.isError && (
          <ErrorState
            title="No pudimos cargar las canchas"
            message={courts.error.message}
            action={<Button onClick={() => courts.refetch()}>Reintentar</Button>}
          />
        )}
        {courts.isSuccess && visible.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
            No hay canchas de este deporte por ahora.
          </p>
        )}
        {visible.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((court, i) => (
              <CourtCard key={court.id} court={court} index={i} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
