import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { redeemPromo, type Profile } from "@/lib/server/profile";
import { PROMO_STORAGE_KEY } from "@/lib/promos";

export function RedeemPromo({
  profile,
  onRedeemed,
}: {
  profile: Profile | null;
  onRedeemed: (next: Profile) => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.planStatus === "comp") {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal/5 p-5">
        <Badge tone="success">Complimentary</Badge>
        <p className="mt-3 font-medium text-fg">You're on Nitefill Pro, on the house.</p>
        <p className="mt-1 text-sm text-muted">
          Daily send cap is {profile.dailyLimit}. No trial clock, no card.
        </p>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const next = await redeemPromo({ data: { code } });
      try {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      onRedeemed(next);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply that code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-fg/8 bg-surface p-5">
      <p className="text-sm font-medium text-fg">Have a promo code?</p>
      <p className="mt-1 text-sm text-muted">
        Redeem it here to drop the trial and run Pro for free.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-label="Promo code"
          className="font-mono uppercase sm:flex-1"
          required
        />
        <Button type="submit" variant="teal" disabled={busy || !code.trim()}>
          {busy ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </form>
  );
}
