import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  expectedSends,
  FIRST_WAVE,
  firstNameOf,
  personalizeTemplate,
  SAFESEND_GAP_MS,
} from "./personalize.ts";

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

  it("fires the first DM the moment SafeSend launches", () => {
    assert.equal(
      expectedSends({ startedAtMs: 1000, nowMs: 1000, dailyLimit: 35, audienceCount: 80 }),
      FIRST_WAVE,
    );
  });

  it("caps at audience size", () => {
    const n = expectedSends({
      startedAtMs: 0,
      nowMs: SAFESEND_GAP_MS * 100,
      dailyLimit: 35,
      audienceCount: 12,
    });
    assert.equal(n, 12);
  });

  it("drips one DM per SafeSend gap rather than dumping the daily limit", () => {
    const early = expectedSends({
      startedAtMs: 0,
      nowMs: SAFESEND_GAP_MS,
      dailyLimit: 35,
      audienceCount: 80,
    });
    const later = expectedSends({
      startedAtMs: 0,
      nowMs: SAFESEND_GAP_MS * 8,
      dailyLimit: 35,
      audienceCount: 80,
    });
    assert.equal(early, 2);
    assert.equal(later, 9);
    assert.ok(early < later);
    assert.ok(later < 20);
  });

  it("reaches the daily cap after enough gaps", () => {
    const n = expectedSends({
      startedAtMs: 0,
      nowMs: SAFESEND_GAP_MS * 50,
      dailyLimit: 35,
      audienceCount: 80,
    });
    assert.equal(n, 35);
  });
});

describe("firstNameOf", () => {
  it("takes the first token", () => {
    assert.equal(firstNameOf("Mandarin Oriental Knightsbridge"), "Mandarin");
  });
});
