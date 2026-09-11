import { cn } from "@/lib/utils";

export function Wordmark({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <a
      href={to}
      className={cn("inline-flex items-center gap-2.5 text-fg", className)}
      aria-label="Nitefill home"
    >
      <img
        src="/brand/logo.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg object-contain"
      />
      <span className="font-display text-lg font-semibold tracking-tight">Nitefill</span>
    </a>
  );
}
