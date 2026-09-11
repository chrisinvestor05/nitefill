import { createFileRoute } from "@tanstack/react-router";
import { AuthPanel } from "@/components/auth/auth-panel";
import type { BillingCycle, PlanId } from "@/data/content";

type Search = { plan?: PlanId; cycle?: BillingCycle };

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    plan:
      search.plan === "starter" || search.plan === "pro" || search.plan === "agency"
        ? search.plan
        : undefined,
    cycle: search.cycle === "yearly" || search.cycle === "monthly" ? search.cycle : undefined,
  }),
  head: () => ({
    meta: [{ title: "Sign up – Nitefill" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { plan = "pro", cycle = "monthly" } = Route.useSearch();
  return <AuthPanel mode="signup" planId={plan} cycle={cycle} />;
}
