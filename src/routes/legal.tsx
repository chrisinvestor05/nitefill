import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/legal")({
  head: () => ({ meta: [{ title: "Legal – Nitefill" }] }),
  component: LegalPage,
});

function LegalPage() {
  const cards = [
    { to: "/privacy", title: "Privacy Policy", body: "How we collect, use, and protect your data." },
    { to: "/terms", title: "Terms of Service", body: "The rules and guidelines for using Nitefill." },
    { to: "/contact", title: "Contact", body: "Reach out if you have questions about any legal matter." },
  ] as const;
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <h1>Legal Information</h1>
        <p className="mt-3 text-muted">Everything related to your rights, data, and how we operate.</p>
        <div className="mt-10 grid gap-4">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="block rounded-xl border border-fg/10 bg-fg/5 p-5 transition-colors hover:border-fg/20 hover:bg-fg/10"
            >
              <h2 className="text-lg text-fg">{c.title}</h2>
              <p className="mt-1 text-sm text-muted">{c.body}</p>
            </Link>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
