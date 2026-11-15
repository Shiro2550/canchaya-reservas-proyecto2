import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/primitives";

export function ErrorState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center" role="alert">
      <span className="grid size-12 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
        <AlertTriangle className="size-6" />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {action}
    </Card>
  );
}
