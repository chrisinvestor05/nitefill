import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-navy">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-teal focus:px-3 focus:py-2 focus:text-navy"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter />
      <a
        href="/contact"
        className="fixed right-4 bottom-5 z-30 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-surface/95 px-4 py-2.5 text-sm font-semibold text-fg shadow-xl shadow-black/40 backdrop-blur-md hover:border-teal/60 sm:right-6"
      >
        <Phone className="h-4 w-4 text-teal" aria-hidden />
        Book a call
      </a>
    </div>
  );
}
