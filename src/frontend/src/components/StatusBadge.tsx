import type { BookingStatus } from "@canchaya/shared";
import { CheckCircle2, CircleSlash, Flag } from "lucide-react";
import { Badge } from "@/components/ui/primitives";

const STATUS = {
  CONFIRMADA: { label: "Confirmada", tone: "green", icon: CheckCircle2 },
  CANCELADA: { label: "Cancelada", tone: "red", icon: CircleSlash },
  COMPLETADA: { label: "Completada", tone: "blue", icon: Flag },
} as const;

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, tone, icon: Icon } = STATUS[status];
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5" />
      {label}
    </Badge>
  );
}
