import { Instagram, Youtube } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";

const cols = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Chrome Extension", href: "/extension" },
      { label: "Guide", href: "/guide" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Legal Hub", href: "/legal" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="text-sm text-fg/60 transition-colors hover:text-teal">
      {label}
    </a>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-fg/8 bg-navy px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Wordmark />
            <p className="max-w-sm text-sm text-muted">
              AI outreach for DJs, promoters, and nightlife brands. Personal
              invites, SafeSend pacing, and a private room for the business of
              staying booked.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/nitefill"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fg/10 text-muted hover:text-teal"
                aria-label="Nitefill on Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@nitefill"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fg/10 text-muted hover:text-teal"
                aria-label="Nitefill on YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-fg">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href} label={l.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-fg/8 pt-6 sm:flex-row">
          <p className="text-xs text-fg/40">© {year} Nitefill. All rights reserved.</p>
          <p className="text-xs text-fg/40">Made with passion for the music industry</p>
        </div>
      </div>
    </footer>
  );
}
