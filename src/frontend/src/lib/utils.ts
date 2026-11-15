import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos (convención de shadcn/ui). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const money = new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" });

/** "60.00" → "$60.00" (Panamá usa el dólar). */
export function formatMoney(value: string | number): string {
  return money.format(Number(value));
}
