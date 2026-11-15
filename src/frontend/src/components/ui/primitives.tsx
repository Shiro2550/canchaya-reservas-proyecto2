/**
 * Componentes base al estilo de shadcn/ui: Card, Input, Label, Badge y Skeleton.
 */
import type { ComponentProps } from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm shadow-xs transition outline-none placeholder:text-slate-400",
        "focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/25",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        "dark:border-slate-700 dark:bg-slate-950",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium", className)} {...props} />;
}

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
      red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
      slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      blue: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    },
  },
  defaultVariants: { tone: "slate" },
});

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800", className)} {...props} />;
}
