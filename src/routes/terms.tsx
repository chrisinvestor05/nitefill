import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service – Nitefill" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <Link to="/" className="text-sm text-teal hover:underline">
          Back to Home
        </Link>
        <h1 className="mt-4">Terms of Service</h1>
        <p className="mt-2 text-sm text-subtle">Last updated: April 05, 2026</p>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <p>
            These Legal Terms constitute a binding agreement between you and
            Nitefill (“Company”, “we”, “us”, “our”).
            By accessing or using our Services, you agree to be bound by these
            Terms. If you do not agree, you must discontinue use immediately.
          </p>
          <h2 className="text-xl text-fg">1. Our Services</h2>
          <p>
            Nitefill operates an AI-powered Instagram DM automation platform for
            DJs, promoters, and venues. Users connect their Instagram account via
            a browser extension, build targeted audience lists, and send
            personalised direct messages to promote events. The Services are not
            intended for users under 18 years old.
          </p>
          <h2 className="text-xl text-fg">2. Intellectual Property Rights</h2>
          <p>
            We own all intellectual property rights in the Services, including
            source code, databases, software, designs, text, and graphics. You
            are granted a limited, revocable licence to access and use the
            Services for your internal business purposes. No part of the Services
            may be copied, reproduced, or distributed without our written
            permission.
          </p>
          <h2 className="text-xl text-fg">3. User Representations</h2>
          <p>
            By using the Services, you represent that all registration
            information is accurate, you are at least 18 years old, and your use
            complies with all applicable laws and regulations.
          </p>
          <h2 className="text-xl text-fg">4. User Registration</h2>
          <p>
            You may be required to register an account. You are responsible for
            maintaining the confidentiality of your login credentials and all
            activity under your account.
          </p>
          <h2 className="text-xl text-fg">5. Purchases and Payment</h2>
          <p>
            You agree to provide accurate billing information and authorize us to
            charge your payment method for subscription fees. Payments are
            handled by a secure third-party payment processor. We reserve the
            right to correct pricing errors and refuse any order.
          </p>
          <h2 className="text-xl text-fg">6. Subscriptions</h2>
          <p>
            Subscriptions automatically renew unless cancelled. A 7-day free
            trial is available to new users. All purchases are non-refundable.
            You may cancel at any time; cancellation takes effect at the end of
            the current billing cycle.
          </p>
          <h2 className="text-xl text-fg">7. Software</h2>
          <p>
            Any software provided as part of the Services is licensed, not sold.
            Software is provided “as is” without warranties of any kind.
          </p>
          <h2 className="text-xl text-fg">8. Prohibited Activities</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use Nitefill to send spam or harassment</li>
            <li>Bypass safety features or rate limits</li>
            <li>Scrape or export data without permission</li>
            <li>Run campaigns on accounts you do not own</li>
            <li>Target minors or prohibited audiences</li>
            <li>Reverse engineer or copy platform code</li>
          </ul>
          <h2 className="text-xl text-fg">9–19. Additional terms</h2>
          <p>
            Connecting your Instagram account allows us to access certain profile
            data and messaging functionality solely for campaign execution. You
            may disconnect at any time. We may modify or discontinue the
            Services. These Terms are governed by applicable laws. Contact{" "}
            <a className="text-teal" href="mailto:hello@nitefill.com">
              hello@nitefill.com
            </a>
            .
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
