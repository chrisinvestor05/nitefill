import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createCampaign, discoverAudience } from "@/lib/server/campaigns";
import { enqueueSenderJob } from "@/components/app/sender-live";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { newId } from "@/lib/server/ids";
import {
  blankCampaign,
  parseHandleList,
  senderDiscoverJob,
  upsertLocalCampaign,
} from "@/lib/client/campaign-store";

export const Route = createFileRoute("/app/campaigns/new")({
  component: NewCampaign,
  head: () => ({ meta: [{ title: "New campaign – Nitefill" }] }),
});

function NewCampaign() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("London");
  const [eventDate, setEventDate] = useState("");
  const [genre, setGenre] = useState("house");
  const [genderFilter, setGenderFilter] = useState("all");
  const [bioKeywords, setBioKeywords] = useState("");
  const [seedAccounts, setSeedAccounts] = useState("fabriclondon, ministryofsound");
  const [messageTemplate, setMessageTemplate] = useState(
    "I'm putting on {event} in {city}. Reckon it'd be your kind of night?",
  );
  const [dailyLimit, setDailyLimit] = useState(35);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const seeds = parseHandleList(seedAccounts);
    if (!seeds.length) {
      setError("Add at least one public Instagram seed account.");
      return;
    }
    setBusy(true);
    setError(null);
    const id = newId("cmp");
    const local = blankCampaign({
      id,
      name: name || eventName || `${city} night`,
      eventName: eventName || null,
      venue: venue || null,
      city,
      eventDate: eventDate || null,
      genre: genre || null,
      genderFilter,
      bioKeywords: bioKeywords || null,
      seedAccounts: seeds.join(", "),
      messageTemplate,
      dailyLimit,
      status: "draft",
      discoverStatus: "pending",
    });
    upsertLocalCampaign(local);
    enqueueSenderJob(senderDiscoverJob(local));
    void createCampaign({
      data: {
        id,
        name: local.name,
        eventName: eventName || undefined,
        venue: venue || undefined,
        city,
        eventDate: eventDate || undefined,
        genre: genre || undefined,
        genderFilter,
        bioKeywords,
        seedAccounts: seeds.join(", "),
        messageTemplate,
        dailyLimit,
      },
    }).catch(() => undefined);
    void discoverAudience({
      data: {
        campaignId: id,
        city,
        gender: genderFilter,
        genre,
        keywords: bioKeywords,
        seedAccounts: seeds.join(", "),
      },
    }).catch(() => undefined);
    await navigate({ to: "/app/campaigns/$id", params: { id } });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl">New campaign</h1>
        <p className="mt-2 text-sm text-muted">
          Seed accounts whose crowd looks like your night. Sender pulls their
          followers, people they follow, and people who like or comment on their
          posts — then sends from your Instagram.
        </p>
        <p className="mt-2 text-xs text-subtle">
          Sender not installed yet?{" "}
          <Link to="/app/connect" className="text-teal hover:underline">
            Connect Instagram
          </Link>
        </p>
      </div>
      <label className="block text-sm text-muted">
        Campaign name
        <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="London rooftop — 14th" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted">
          The night
          <Input className="mt-1.5" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="a rooftop house night" />
        </label>
        <label className="block text-sm text-muted">
          Venue
          <Input className="mt-1.5" value={venue} onChange={(e) => setVenue(e.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          City
          <Input className="mt-1.5" required value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Date
          <Input className="mt-1.5" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="the 14th" />
        </label>
        <label className="block text-sm text-muted">
          Genre
          <Input className="mt-1.5" value={genre} onChange={(e) => setGenre(e.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Gender filter
          <select
            className="mt-1.5 h-11 w-full rounded-xl border border-fg/12 bg-surface px-4 text-sm text-fg"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
      </div>
      <label className="block text-sm text-muted">
        Seed Instagram accounts
        <Input
          className="mt-1.5"
          required
          value={seedAccounts}
          onChange={(e) => setSeedAccounts(e.target.value)}
          placeholder="fabriclondon, ministryofsound"
        />
        <span className="mt-1 block text-xs text-subtle">
          Public pages. If Instagram hides the follower list, Sender still reads following, likes and comments.
        </span>
      </label>
      <label className="block text-sm text-muted">
        Bio keywords
        <Input className="mt-1.5" value={bioKeywords} onChange={(e) => setBioKeywords(e.target.value)} placeholder="fabric, rooftop, house" />
      </label>
      <label className="block text-sm text-muted">
        Source message
        <Textarea className="mt-1.5" value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} />
        <span className="mt-1 block text-xs text-subtle">Use {"{name}"}, {"{event}"}, {"{city}"} — or leave it plain and we'll rewrite it.</span>
      </label>
      <label className="block text-sm text-muted">
        Daily limit ({dailyLimit})
        <input
          type="range"
          min={10}
          max={100}
          value={dailyLimit}
          onChange={(e) => setDailyLimit(Number(e.target.value))}
          className="mt-3 w-full accent-teal"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save and find people"}
      </Button>
    </form>
  );
}
