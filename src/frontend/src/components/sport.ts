import type { Sport } from "@canchaya/shared";

/** Identidad visual de cada deporte en tarjetas y encabezados. */
export const SPORT_STYLE: Record<Sport, { emoji: string; gradient: string }> = {
  FUTBOL_7: { emoji: "⚽", gradient: "from-emerald-500 to-green-700" },
  PADEL: { emoji: "🏓", gradient: "from-sky-500 to-blue-700" },
  TENIS: { emoji: "🎾", gradient: "from-lime-500 to-emerald-700" },
  BASQUETBOL: { emoji: "🏀", gradient: "from-orange-500 to-red-600" },
};
