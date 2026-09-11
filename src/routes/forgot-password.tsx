import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/brand/logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password – Nitefill" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const client = authClient as typeof authClient & {
        requestPasswordReset?: (opts: { email: string; redirectTo: string }) => Promise<unknown>;
        forgetPassword?: (opts: { email: string; redirectTo: string }) => Promise<unknown>;
      };
      if (typeof client.requestPasswordReset === "function") {
        await client.requestPasswordReset({ email, redirectTo: "/login" });
      } else if (typeof client.forgetPassword === "function") {
        await client.forgetPassword({ email, redirectTo: "/login" });
      }
    } catch {
      /* always show the same success copy */
    }
    setDone(true);
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md space-y-6">
        <Wordmark />
        <h1 className="text-2xl">Forgot your password?</h1>
        <p className="text-sm text-muted">
          No worries, we'll send you reset instructions.
        </p>
        {done ? (
          <p className="rounded-xl border border-fg/10 bg-surface p-4 text-sm text-muted">
            If an account exists with this email, a password reset link has been
            sent. Please check your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm text-muted">
              Email
              <Input
                className="mt-1.5"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <Link to="/login" className="block text-sm text-teal hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
