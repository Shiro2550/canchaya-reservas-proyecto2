import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { BOOKING_CODE_REGEX } from "@canchaya/shared";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";

/** Búsqueda de una reserva por su código (US-04). */
export function FindBookingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = code.trim().toUpperCase();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!BOOKING_CODE_REGEX.test(normalized)) {
      setError("El código tiene el formato CY- seguido de 8 letras o números, por ejemplo CY-7K3M9QXA.");
      return;
    }
    navigate(`/reserva/${normalized}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Mi reserva</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Ingresa el código que recibiste al reservar para ver el detalle o cancelar.
        </p>
      </div>
      <Card className="p-6">
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="code">Código de reserva</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="CY-7K3M9QXA"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={20}
              aria-invalid={!!error}
              className="h-12 text-center font-mono text-lg tracking-widest uppercase"
            />
            {error && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" size="lg">
            <Search /> Buscar reserva
          </Button>
        </form>
      </Card>
    </div>
  );
}
