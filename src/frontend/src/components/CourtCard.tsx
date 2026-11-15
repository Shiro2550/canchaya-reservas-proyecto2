import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SPORT_LABELS, type CourtResponse } from "@canchaya/shared";
import { Card } from "@/components/ui/primitives";
import { SPORT_STYLE } from "@/components/sport";
import { formatMoney } from "@/lib/utils";

export function CourtCard({ court, index }: { court: CourtResponse; index: number }) {
  const style = SPORT_STYLE[court.sport];
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Link to={`/canchas/${court.id}`} className="group block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-brand-500/40">
        <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
          <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${style.gradient}`}>
            <span className="text-6xl drop-shadow-lg transition group-hover:scale-110" aria-hidden>
              {style.emoji}
            </span>
            <span className="absolute top-3 left-3 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
              {SPORT_LABELS[court.sport]}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3 p-4">
            <div>
              <h3 className="font-bold leading-tight">{court.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatMoney(court.hourly_rate)}</span> / hora
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-400">
              Ver horarios <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Card>
      </Link>
    </motion.li>
  );
}
