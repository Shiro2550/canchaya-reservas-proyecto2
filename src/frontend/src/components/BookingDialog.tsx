import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import {
  customerEmailSchema,
  customerNameSchema,
  customerPhoneSchema,
  type AvailabilitySlot,
  type CourtResponse,
} from "@canchaya/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/primitives";
import { ApiError, useCreateBooking } from "@/lib/api";
import { longDateLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";

/** Mismas reglas que valida la API (BR-03), compartidas desde @canchaya/shared. */
const contactSchema = z.object({
  customer_name: customerNameSchema,
  customer_phone: customerPhoneSchema,
  customer_email: customerEmailSchema,
});
type ContactForm = z.infer<typeof contactSchema>;

interface Props {
  court: CourtResponse;
  date: string;
  slot: AvailabilitySlot | null;
  onClose: () => void;
}

export function BookingDialog({ court, date, slot, onClose }: Props) {
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { customer_name: "", customer_phone: "", customer_email: "" },
    mode: "onTouched",
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit(async (contact) => {
    if (!slot) return;
    try {
      const booking = await createBooking.mutateAsync({
        court_id: court.id,
        date,
        start_time: slot.start_time,
        ...contact,
      });
      onClose();
      navigate(`/reserva/${booking.booking_id}`, { state: { justBooked: true } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo completar la reserva.";
      if (error instanceof ApiError && (error.code === "BOOKING_CONFLICT" || error.code === "PAST_DATE_TIME")) {
        // Otro cliente tomó el turno (o ya empezó): se cierra y la grilla se actualiza sola.
        toast.error("Ese turno ya no está disponible", { description: message });
        onClose();
        return;
      }
      toast.error("No se pudo reservar", { description: message });
    }
  });

  return (
    <Dialog
      open={slot !== null}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Confirma tu reserva</DialogTitle>
        <DialogDescription>Sin crear cuenta: solo tus datos de contacto.</DialogDescription>

        {slot && (
          <dl className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-600" />
              <dt className="sr-only">Cancha</dt>
              <dd className="font-semibold">{court.name}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand-600" />
              <dt className="sr-only">Fecha</dt>
              <dd>{longDateLabel(date)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand-600" />
              <dt className="sr-only">Horario</dt>
              <dd>
                {slot.start_time} – {slot.end_time} · <span className="font-semibold">{formatMoney(court.hourly_rate)}</span>
              </dd>
            </div>
          </dl>
        )}

        <form onSubmit={submit} className="mt-5 grid gap-4" noValidate>
          <Field id="customer_name" label="Nombre y apellido" error={errors.customer_name?.message}>
            <Input
              id="customer_name"
              autoComplete="name"
              placeholder="Carlos Méndez"
              aria-invalid={!!errors.customer_name}
              {...form.register("customer_name")}
            />
          </Field>
          <Field id="customer_phone" label="Teléfono" error={errors.customer_phone?.message}>
            <Input
              id="customer_phone"
              type="tel"
              autoComplete="tel"
              placeholder="+507 6123-4567"
              aria-invalid={!!errors.customer_phone}
              {...form.register("customer_phone")}
            />
          </Field>
          <Field id="customer_email" label="Correo electrónico" error={errors.customer_email?.message}>
            <Input
              id="customer_email"
              type="email"
              autoComplete="email"
              placeholder="carlos@example.com"
              aria-invalid={!!errors.customer_email}
              {...form.register("customer_email")}
            />
          </Field>

          <Button type="submit" size="lg" className="mt-2" disabled={createBooking.isPending}>
            {createBooking.isPending ? <Loader2 className="animate-spin" /> : null}
            {createBooking.isPending ? "Reservando…" : "Reservar ahora"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            Podrás cancelar con tu código hasta 2 horas antes del inicio.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
