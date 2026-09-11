import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy – Nitefill" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <Link to="/" className="text-sm text-teal hover:underline">
          Back to Home
        </Link>
        <h1 className="mt-4">Privacy Policy</h1>
        <p className="mt-2 text-sm text-subtle">How we collect, use, and protect your data.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Nitefill processes account data, campaign configuration, and limited
            public Instagram profile signals solely to run the outreach you
            approve. We do not sell personal information.
          </p>
          <h2 className="text-xl text-fg">1. Information we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details: name, email, hashed password, plan selection</li>
            <li>Campaign data: events, cities, message templates, send logs</li>
            <li>Public Instagram profile fields used for personalisation</li>
            <li>Support messages you send us</li>
          </ul>
          <h2 className="text-xl text-fg">2. How we use it</h2>
          <p>
            To operate the product, personalise invites, keep accounts safe with
            SafeSend, provide The Room, and communicate about your subscription.
          </p>
          <h2 className="text-xl text-fg">3. Processors</h2>
          <p>
            Hosting, authentication, email delivery, and campaign execution
            providers process data on our behalf. We do not share data for
            third-party marketing.
          </p>
          <h2 className="text-xl text-fg">4. Cookies</h2>
          <p>
            First-party cookies for session, authentication, and security only.
            Rejecting session cookies will prevent dashboard login.
          </p>
          <h2 className="text-xl text-fg">5. Your rights</h2>
          <p>
            Access, correction, deletion, objection, portability, and withdrawal
            of consent, depending on your location. Email{" "}
            <a className="text-teal" href="mailto:hello@nitefill.com">
              hello@nitefill.com
            </a>
            .
          </p>
          <h2 className="text-xl text-fg">6. Retention</h2>
          <p>
            We retain your data while the account is active, plus 6 months after
            termination.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
