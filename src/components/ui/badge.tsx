import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "teal",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "teal" | "orange" | "muted" | "success" | "danger" }) {
  const tones = {
    teal: "border-teal/30 bg-teal/10 text-teal",
    orange: "border-orange/30 bg-orange/10 text-orange",
    muted: "border-fg/10 bg-fg/5 text-muted",
    success: "border-success/30 bg-success/10 text-success",
    danger: "border-danger/30 bg-danger/10 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
