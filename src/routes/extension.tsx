import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/extension")({
  head: () => ({ meta: [{ title: "Chrome extension – Nitefill" }] }),
  component: ExtensionPage,
});

function ExtensionPage() {
  const steps = [
    {
      t: "Download Nitefill Sender",
      d: "Unzip the folder. It contains manifest.json — that is the extension.",
    },
    {
      t: "Load it in Chrome",
      d: "chrome://extensions → Developer mode → Load unpacked → select the unzipped folder. Phones cannot run extensions.",
    },
    {
      t: "Sign in to Instagram in that Chrome",
      d: "That is the whole connection. Nitefill never sees your password. The dashboard shows the account the moment Sender sees it.",
    },
    {
      t: "Come back to Nitefill in a Chrome tab",
      d: "Open nitefill.vercel.app — not a preview frame. The page pairs itself. If it does not, copy the pairing code and paste it in the extension popup.",
    },
  ];
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <p className="text-sm font-medium text-teal">Chrome extension</p>
        <h1 className="mt-2">Nitefill Sender</h1>
        <p className="mt-4 text-muted">
          Sends your invitations from your own browser, signed in as you. Nothing
          to paste, nothing to hand over. This is how the messages actually leave
          — not a simulation, not a third-party Instagram login.
        </p>
        <div className="mt-8">
          <a href="/nitefill-sender.zip" download>
            <Button size="lg">Download Nitefill Sender</Button>
          </a>
        </div>
        <ol className="mt-10 space-y-5">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-fg/8 bg-surface p-5">
              <p className="text-xs text-orange">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-lg">{s.t}</h2>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/app/connect" className="text-teal hover:underline">
            Pair it from Instagram in the dashboard
          </Link>
          .
        </p>
      </main>
    </SiteShell>
  );
}
