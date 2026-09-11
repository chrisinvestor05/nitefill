import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expectedSends, firstNameOf, personalizeTemplate } from "./personalize.ts";

describe("personalizeTemplate", () => {
  const profile = {
    displayName: "Maya Chen",
    handle: "maya.moves",
    city: "London",
    bio: "House / disco.",
    recentPost: "Still thinking about that Fabric terrace set.",
    genreTags: ["house"],
  };

  it("substitutes template tokens", () => {
    const out = personalizeTemplate(
      "hey {name} — {event} in {city} this week. you around?",
      profile,
      "a rooftop",
      "London",
    );
    assert.match(out, /Maya/);
    assert.match(out, /rooftop/);
  });

  it("writes a unique opener from an empty template", () => {
    const out = personalizeTemplate("", profile, "a rooftop thing", "London");
    assert.match(out, /Maya/i);
    assert.ok(out.length > 40);
  });
});

describe("expectedSends", () => {
  it("sends nothing before start", () => {
    assert.equal(
      expectedSends({ startedAtMs: 1000, nowMs: 999, dailyLimit: 35, audienceCount: 80 }),
      0,
    );
  });

  it("caps at audience size", () => {
    const day = 24 * 60 * 60 * 1000;
    const n = expectedSends({
      startedAtMs: 0,
      nowMs: day * 10,
      dailyLimit: 35,
      audienceCount: 12,
    });
    assert.equal(n, 12);
  });

  it("ramps within the first day rather than dumping the daily limit", () => {
    const hour = 60 * 60 * 1000;
    const early = expectedSends({
      startedAtMs: 0,
      nowMs: hour,
      dailyLimit: 35,
      audienceCount: 80,
    });
    const later = expectedSends({
      startedAtMs: 0,
      nowMs: 8 * hour,
      dailyLimit: 35,
      audienceCount: 80,
    });
    assert.ok(early < later);
    assert.ok(early < 20);
  });
});

describe("firstNameOf", () => {
  it("takes the first token", () => {
    assert.equal(firstNameOf("Mandarin Oriental Knightsbridge"), "Mandarin");
  });
});
