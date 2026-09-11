import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { planById, monthlyEquivalent, type BillingCycle, type PlanId } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMoneyExact } from "@/lib/utils";
import { Wordmark } from "@/components/brand/logo";
import { lookupPromo, PROMO_STORAGE_KEY } from "@/lib/promos";

const CHECKS = [
  { test: (t: string) => t.length >= 8, message: "At least 8 characters" },
  { test: (t: string) => /[A-Z]/.test(t), message: "An uppercase letter" },
  { test: (t: string) => /[a-z]/.test(t), message: "A lowercase letter" },
  { test: (t: string) => /[0-9]/.test(t), message: "A number" },
  { test: (t: string) => /[^A-Za-z0-9]/.test(t), message: "A symbol" },
];

function passwordOk(pw: string) {
  return CHECKS.every((c) => c.test(pw));
}

export function persistPlanChoice(plan: string, cycle: string, promo?: string) {
  try {
    localStorage.setItem("nitefill.plan", plan);
    localStorage.setItem("nitefill.cycle", cycle);
    if (promo === undefined) return;
    const grant = lookupPromo(promo);
    if (grant) localStorage.setItem(PROMO_STORAGE_KEY, grant.code);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthPanel({
  mode,
  planId = "pro",
  cycle = "monthly",
}: {
  mode: "login" | "signup";
  planId?: string;
  cycle?: string;
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promo, setPromo] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = planById(planId);
  const billing = (cycle === "yearly" ? "yearly" : "monthly") as BillingCycle;
  const dest = "/app";
  const grant = promo.trim() ? lookupPromo(promo) : null;

  async function onOAuth(providerId: string) {
    setError(null);
    if (tab === "signup" && promo.trim() && !grant) {
      setError("That promo code isn't valid.");
      return;
    }
    setOauthBusy(providerId);
    persistPlanChoice(plan.id, billing, tab === "signup" ? promo : undefined);
    try {
      await signIn(providerId, { callbackURL: dest, errorCallbackURL: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setOauthBusy(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (tab === "signup") {
      if (!terms) {
        setError("Please agree to the Terms and Privacy Policy.");
        return;
      }
      if (!passwordOk(password)) {
        setError("Use 8+ characters with upper, lower, a number and a symbol.");
        return;
      }
      if (promo.trim() && !grant) {
        setError("That promo code isn't valid.");
        return;
      }
    }
    setBusy(true);
    persistPlanChoice(plan.id, billing, tab === "signup" ? promo : undefined);
    try {
      if (tab === "signup") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Member",
          callbackURL: dest,
        });
        if (err) throw new Error(err.message || "Could not create that account.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: dest,
        });
        if (err) throw new Error(err.message || "Login failed. Please try again.");
      }
      await navigate({ to: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-navy">
      <aside className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, var(--color-navy) 0%, var(--color-brand) 55%, color-mix(in oklab, var(--color-teal) 35%, var(--color-navy)) 100%)",
          }}
        />
        <div className="relative">
          <Wordmark />
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="text-sm font-medium text-teal">Fill every event with the right crowd</p>
          <h1 className="text-4xl leading-tight">
            Turn your Instagram into a booking machine
          </h1>
          <p className="text-muted">
            Join leading DJs and promoters using personal invites to fill their events.
          </p>
          {tab === "signup" && (
            <div className="rounded-2xl border border-fg/12 bg-navy/40 p-4">
              <p className="text-xs text-subtle">Starting with</p>
              <p className="mt-1 font-display text-lg font-semibold text-fg">
                {grant ? grant.label : plan.name}
              </p>
              <p className="text-sm text-muted">
                {grant
                  ? "Promo applied · no card, no trial clock"
                  : `${formatMoneyExact(monthlyEquivalent(plan, billing))} /mo · 7-day free trial`}
              </p>
            </div>
          )}
        </div>
        <p className="relative text-xs text-fg/50">SafeSend · No password for Instagram · Cancel anytime</p>
      </aside>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-panel p-1">
            <Link
              to="/login"
              className={`rounded-md py-2 text-center text-sm font-medium transition-colors ${
                tab === "login" ? "bg-teal text-navy" : "text-fg/60 hover:text-fg"
              }`}
              onClick={() => setTab("login")}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              search={{ plan: plan.id as PlanId, cycle: billing }}
              className={`rounded-md py-2 text-center text-sm font-medium transition-colors ${
                tab === "signup" ? "bg-orange text-fg" : "text-fg/60 hover:text-fg"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </Link>
          </div>
          <h2 className="mb-1">{tab === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mb-6 text-sm text-muted">
            {tab === "login"
              ? "Enter your credentials to access your account"
              : grant
                ? "Promo locked in. Create your account to start on Pro."
                : "Start your 7-day free trial today"}
          </p>
          {tab === "signup" && (
            <Badge className="mb-4" tone="orange">
              {grant ? grant.label : `${plan.name} · ${billing}`}
            </Badge>
          )}
          <div className="grid gap-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant="ghost"
                className="w-full"
                disabled={Boolean(oauthBusy)}
                onClick={() => onOAuth(p.providerId)}
              >
                {oauthBusy === p.providerId ? "Connecting…" : `Continue with ${p.label}`}
              </Button>
            ))}
          </div>
          <p className="my-5 text-center text-xs text-subtle">or continue with email</p>
          <form onSubmit={onSubmit} className="space-y-3">
            {tab === "signup" && (
              <label className="block text-sm text-muted">
                Full name
                <Input
                  className="mt-1.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label className="block text-sm text-muted">
              Email
              <Input
                className="mt-1.5"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block text-sm text-muted">
              Password
              <div className="relative mt-1.5">
                <Input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {tab === "signup" && password.length > 0 && (
              <ul className="space-y-1 text-xs">
                {CHECKS.map((c) => (
                  <li
                    key={c.message}
                    className={c.test(password) ? "text-success" : "text-subtle"}
                  >
                    {c.message}
                  </li>
                ))}
              </ul>
            )}
            {tab === "signup" && (
              <label className="block text-sm text-muted">
                Promo code (optional)
                <Input
                  className="mt-1.5 font-mono uppercase"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="characters"
                  placeholder="Have a code?"
                />
              </label>
            )}
            {tab === "login" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-teal hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
            {tab === "signup" && (
              <label className="flex items-start gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-teal"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="text-teal hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-teal hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            )}
            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant={tab === "login" ? "teal" : "orange"}
              className="mt-2 w-full"
              disabled={busy}
            >
              {busy ? "Please wait…" : tab === "login" ? "Log in" : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-subtle">
            {grant ? "Complimentary Pro · No credit card required" : "7-day free trial · No credit card required"}
          </p>
        </div>
      </main>
    </div>
  );
}
