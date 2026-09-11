import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { joinRoomWaitlist } from "@/lib/server/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RoomModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await joinRoomWaitlist({ data: { email, instagram } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-signup-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[420px] rounded-2xl border border-fg/12 bg-surface p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-fg/40 hover:text-fg"
        >
          <X className="h-5 w-5" />
        </button>
        {done ? (
          <div className="py-6 text-center">
            <h2 id="room-signup-heading" className="mb-2 text-fg">
              You're in.
            </h2>
            <p className="text-sm text-muted">
              We'll send Room access details to {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 id="room-signup-heading" className="text-fg">
              Join The Room
            </h2>
            <p className="text-sm text-muted">
              136 lessons on the business of getting booked. Drop your email and
              we'll set you up.
            </p>
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
              Instagram handle
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle">
                  @
                </span>
                <Input
                  className="pl-8"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@+/, ""))}
                  placeholder="yourhandle"
                />
              </div>
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Request access"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
