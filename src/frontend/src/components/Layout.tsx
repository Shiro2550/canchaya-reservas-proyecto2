import { NavLink, Outlet, ScrollRestoration } from "react-router";
import { CalendarCheck, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Canchas", icon: LayoutGrid, end: true },
  { to: "/mi-reserva", label: "Mi reserva", icon: CalendarCheck, end: false },
];

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-lg text-white shadow-md shadow-brand-600/30">
              ⚽
            </span>
            <span>
              Cancha<span className="text-brand-600 dark:text-brand-400">Ya</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1" aria-label="Principal">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                  )
                }
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        CanchaYa · Reserva sin crear cuenta · Horario del complejo: 08:00 – 23:00 (hora de Panamá)
      </footer>
      <ScrollRestoration />
    </div>
  );
}
