import { useEffect, useState } from "react";
import { SPORTS, type HealthResponse } from "@canchaya/shared";

type ApiState = { kind: "loading" } | { kind: "ok"; health: HealthResponse } | { kind: "error" };

const SPORT_LABELS: Record<(typeof SPORTS)[number], string> = {
  FUTBOL_7: "Fútbol 7",
  PADEL: "Pádel",
  TENIS: "Tenis",
  BASQUETBOL: "Básquetbol",
};

/**
 * Pantalla inicial del andamiaje (issue #27): confirma que la SPA llega a la API.
 * Las pantallas del flujo de reserva se construyen en TASK-15 (issue #29).
 */
export function App() {
  const [api, setApi] = useState<ApiState>({ kind: "loading" });

  useEffect(() => {
    fetch("/api/v1/health")
      .then(async (res) => setApi({ kind: "ok", health: (await res.json()) as HealthResponse }))
      .catch(() => setApi({ kind: "error" }));
  }, []);

  const dbOk = api.kind === "ok" && api.health.database === "ok";

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-16">
      <header className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-900 dark:bg-brand-900/40 dark:text-brand-50">
          ⚽ Reserva sin crear cuenta
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Cancha<span className="text-brand-600">Ya</span>
        </h1>
        <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
          Encuentra un horario libre y aparta tu cancha en menos de un minuto. Solo necesitas tu nombre,
          teléfono y correo.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPORTS.map((sport) => (
          <li
            key={sport}
            className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {SPORT_LABELS[sport]}
          </li>
        ))}
      </ul>

      <footer className="flex items-center gap-2 text-sm text-slate-500" aria-live="polite">
        <span
          className={`size-2.5 rounded-full ${
            api.kind === "loading" ? "animate-pulse bg-slate-400" : dbOk ? "bg-brand-500" : "bg-red-500"
          }`}
        />
        {api.kind === "loading" && "Conectando con la API…"}
        {api.kind === "ok" && (dbOk ? "API y base de datos disponibles" : "API disponible, base de datos sin conexión")}
        {api.kind === "error" && "No se pudo conectar con la API"}
      </footer>
    </main>
  );
}
