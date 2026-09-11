import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/data/content";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/logo";
import { AuthSlot } from "./auth-slot";

function NavItem({
  href,
  name,
  className,
}: {
  href: string;
  name: string;
  className?: string;
}) {
  return (
    <a href={href} className={className}>
      {name}
    </a>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-fg/5 bg-navy/95 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active =
              link.href.startsWith("/#") && pathname === "/"
                ? hash === link.href.slice(1)
                : pathname === link.href;
            return (
              <NavItem
                key={link.name}
                href={link.href}
                name={link.name}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-teal" : "text-fg/70 hover:bg-fg/5 hover:text-fg",
                )}
              />
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <AuthSlot />
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div id="mobile-nav" className={cn("px-4 pb-4 lg:hidden", open ? "block" : "hidden")}>
        <div className="rounded-2xl border border-fg/10 bg-surface shadow-2xl">
          {NAV_LINKS.map((link) => (
            <NavItem
              key={link.name}
              href={link.href}
              name={link.name}
              className="block rounded-xl px-4 py-3.5 text-base font-medium text-fg/80 hover:bg-fg/5 hover:text-fg"
            />
          ))}
          <div className="border-t border-fg/8 px-4 py-3">
            <AuthSlot />
          </div>
        </div>
      </div>
    </header>
  );
}
