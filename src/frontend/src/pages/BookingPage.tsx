import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CalendarDays, Check, Clock, Copy, Loader2, Mail, MapPin, PartyPopper, Phone, User } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Card, Skeleton } from "@/components/ui/primitives";
import { ApiError, useBooking, useCancelBooking } from "@/lib/api";
import { canStillCancel, longDateLabel } from "@/lib/dates";

/** Confirmación y autogestión de la reserva por código (US-04, US-05, OC-03). */
export function BookingPage() {
  const { code = "" } = useParams();
  const location = useLocation();
  const justBooked = (location.state as { justBooked?: boolean } | null)?.justBooked === true;
  const booking = useBooking(code);
  const cancel = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (booking.isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (booking.isError) {
    const notFound = booking.error instanceof ApiError && booking.error.code === "BOOKING_NOT_FOUND";
    return (
      <ErrorState
        title={notFound ? "Reserva no encontrada" : "No pudimos cargar la reserva"}
        message={booking.error.message}
        action={
          <Button asChild>
            <Link to="/mi-reserva">Buscar otro código</Link>
          </Button>
        }
      />
    );
  }

  const b = booking.data;
  const cancellable = b.status === "CONFIRMADA" && canStillCancel(b.date, b.start_time);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(b.booking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Anota el código manualmente.");
    }
  };

  const doCancel = async () => {
    try {
      await cancel.mutateAsync(b.booking_id);
      toast.success("Reserva cancelada", { description: "El turno quedó libre para otros jugadores." });
    } catch (error) {
      toast.error("No se pudo cancelar", {
        description: error instanceof ApiError ? error.message : "Intenta de nuevo en unos minutos.",
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {justBooked && b.status === "CONFIRMADA" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
          role="status"
        >
          <PartyPopper className="size-6 shrink-0" />
          <p>
            <span className="font-bold">¡Reserva confirmada!</span> Guarda tu código: es lo único que necesitas para
            consultar o cancelar.
          </p>
        </motion.div>
      )}

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-white/70">Código de reserva</p>
            <StatusBadge status={b.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="font-mono text-3xl font-bold tracking-widest sm:text-4xl" aria-label={`Código ${b.booking_id.split("").join(" ")}`}>
              {b.booking_id}
            </p>
            <Button variant="outline" size="sm" onClick={copyCode} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              {copied ? <Check /> : <Copy />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>

        <dl className="grid gap-4 p-6 sm:grid-cols-2">
          <Detail icon={MapPin} label="Cancha" value={b.court_name} />
          <Detail icon={CalendarDays} label="Fecha" value={longDateLabel(b.date)} />
          <Detail icon={Clock} label="Horario" value={`${b.start_time} – ${b.end_time}`} />
          <Detail icon={User} label="A nombre de" value={b.customer_name} />
          <Detail icon={Phone} label="Teléfono" value={b.customer_phone} />
          <Detail icon={Mail} label="Correo" value={b.customer_email} />
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold">¿No podrás asistir?</h2>
        {b.status === "CONFIRMADA" && cancellable && (
          <>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Puedes cancelar hasta 2 horas antes del inicio y el turno quedará libre para otro equipo.
            </p>
            <Button variant="destructive" className="mt-4" onClick={() => setConfirmOpen(true)}>
              Cancelar reserva
            </Button>
          </>
        )}
        {b.status === "CONFIRMADA" && !cancellable && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ya no es posible cancelar: faltan menos de 2 horas para el inicio del turno.
          </p>
        )}
        {b.status === "CANCELADA" && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Esta reserva fue cancelada y el turno quedó libre.</p>
        )}
        {b.status === "COMPLETADA" && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Este turno ya se jugó. ¡Gracias por usar CanchaYa!</p>
        )}
        <Button variant="link" asChild className="mt-2 px-0">
          <Link to={`/canchas/${b.court_id}`}>Reservar otro horario en esta cancha</Link>
        </Button>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>¿Cancelar la reserva?</DialogTitle>
          <DialogDescription>
            {b.court_name} · {longDateLabel(b.date)} · {b.start_time}. Esta acción no se puede deshacer.
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Mantener reserva
            </Button>
            <Button variant="destructive" onClick={doCancel} disabled={cancel.isPending}>
              {cancel.isPending && <Loader2 className="animate-spin" />}
              Sí, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}
