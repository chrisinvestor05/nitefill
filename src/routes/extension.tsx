import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/extension")({
  head: () => ({ meta: [{ title: "Chrome extension – Nitefill" }] }),
  component: ExtensionPage,
});

function ExtensionPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <p className="text-sm font-medium text-teal">Chrome extension</p>
        <h1 className="mt-2">Nitefill Sender</h1>
        <p className="mt-4 text-muted">
          Sends your invitations from your own browser, signed in as you. Nothing
          to paste, nothing to hand over.
        </p>
        <ol className="mt-10 space-y-6">
          {[
            {
              t: "Add Nitefill Sender to Chrome",
              d: "One click from the Chrome Web Store. It sits quietly in your toolbar.",
            },
            {
              t: "Open Instagram in the same Chrome and sign in",
              d: "That is the whole connection. Your Nitefill dashboard shows the account the moment it sees it.",
            },
            {
              t: "Launch a campaign",
              d: "Invitations go out one at a time, from your account, in your browser, while the tab is open.",
            },
          ].map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-fg/8 bg-surface p-5">
              <p className="text-xs text-orange">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-lg">{s.t}</h2>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-2xl border border-fg/10 bg-surface p-6">
          <p className="font-medium text-fg">Not on the Chrome Web Store yet.</p>
          <p className="mt-2 text-sm text-muted">
            Early customers get it directly from us. Get in touch and we will set you up.
            Phones cannot run extensions — Google Chrome on a computer, Instagram
            tab left open while a campaign runs.
          </p>
          <Link to="/contact" className="mt-4 inline-block">
            <Button>Get in touch</Button>
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
