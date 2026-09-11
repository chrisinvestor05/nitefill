import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listAudience, type AudienceRow } from "@/lib/server/campaigns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/audience")({
  component: AudiencePage,
  head: () => ({ meta: [{ title: "Audience – Nitefill" }] }),
});

function AudiencePage() {
  const [rows, setRows] = useState<AudienceRow[]>([]);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");

  useEffect(() => {
    void listAudience({ data: {} }).then(setRows);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (gender !== "all" && r.gender !== gender) return false;
      if (!q.trim()) return true;
      const blob = `${r.displayName} ${r.handle} ${r.bio} ${r.city}`.toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [rows, q, gender]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Audience</h1>
        <p className="mt-2 text-sm text-muted">
          People already attached to your campaigns. Search and filter — this is your room, not a bought list.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search name, bio, city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-xl border border-fg/12 bg-surface px-3 text-sm text-fg"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="all">All genders</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No one here yet. Create a campaign to discover people near you.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-2xl border border-fg/8 bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-fg">{p.displayName}</p>
                  <p className="text-xs text-subtle">@{p.handle}</p>
                </div>
                <Badge>{p.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{p.bio}</p>
              <p className="mt-2 text-xs text-subtle">
                {p.city} · {p.matchScore}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
