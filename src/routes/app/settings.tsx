import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PLANS, monthlyEquivalent, type BillingCycle, type PlanId } from "@/data/content";
import {
  getProfile,
  planStatusLabel,
  updateProfile,
  type Profile,
} from "@/lib/server/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RedeemPromo } from "@/components/app/redeem-promo";
import { formatMoneyExact } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings – Nitefill" }] }),
});

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [dailyLimit, setDailyLimit] = useState(35);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getProfile().then((p) => {
      setProfile(p);
      setName(p?.name ?? "");
      setCity(p?.city ?? "");
      setDailyLimit(p?.dailyLimit ?? 35);
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const next = await updateProfile({ data: { name, city, dailyLimit } });
    setProfile(next);
    setSaved(true);
    setBusy(false);
  }

  async function choose(planId: PlanId, billingCycle: BillingCycle) {
    setBusy(true);
    const next = await updateProfile({ data: { planId, billingCycle, planStatus: "trial" } });
    setProfile(next);
    try {
      localStorage.setItem("nitefill.plan", planId);
      localStorage.setItem("nitefill.cycle", billingCycle);
    } catch {
      /* ignore */
    }
    setBusy(false);
  }

  async function cancel() {
    setBusy(true);
    const next = await updateProfile({ data: { planStatus: "canceled" } });
    setProfile(next);
    setBusy(false);
  }

  const comped = profile?.planStatus === "comp";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted">Profile, plan, and SafeSend defaults.</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-fg/8 bg-surface p-6">
        <h2 className="text-lg">Profile</h2>
        <label className="block text-sm text-muted">
          Name
          <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Home city
          <Input className="mt-1.5" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Default daily limit ({dailyLimit})
          <input
            type="range"
            min={10}
            max={100}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="mt-3 w-full accent-teal"
          />
        </label>
        <Button type="submit" disabled={busy}>
          {saved ? "Saved" : busy ? "Saving…" : "Save"}
        </Button>
      </form>
      <RedeemPromo
        profile={profile}
        onRedeemed={(next) => {
          setProfile(next);
          setDailyLimit(next.dailyLimit);
        }}
      />
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg">Plan</h2>
          {profile && (
            <Badge tone={comped ? "success" : profile.planStatus === "trial" ? "orange" : "teal"}>
              {planStatusLabel(profile.planStatus)}
            </Badge>
          )}
        </div>
        {comped ? (
          <p className="text-sm text-muted">
            Promo lock is on. Plan changes and cancel don't apply while this grant is active.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Card billing is not connected in this environment. Choosing a plan starts
            (or continues) the 7-day trial on that tier. Cancel any time — it takes
            effect at the end of the cycle. Or redeem a promo code above.
          </p>
        )}
        <div className="grid gap-3">
          {PLANS.map((plan) => {
            const on = profile?.planId === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
                  on ? "border-teal/40 bg-teal/5" : "border-fg/8 bg-surface",
                )}
              >
                <div>
                  <p className="font-medium text-fg">{plan.name}</p>
                  <p className="text-xs text-subtle">
                    {comped && on
                      ? "Included with your promo"
                      : `${formatMoneyExact(monthlyEquivalent(plan, (profile?.billingCycle as BillingCycle) || "monthly"))}/mo`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={on ? "teal" : "ghost"}
                    disabled={busy || comped}
                    onClick={() => choose(plan.id, "monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy || comped}
                    onClick={() => choose(plan.id, "yearly")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {profile?.planStatus !== "canceled" && !comped && (
          <Button variant="ghost" onClick={cancel} disabled={busy}>
            Cancel subscription
          </Button>
        )}
      </section>
    </div>
  );
}
