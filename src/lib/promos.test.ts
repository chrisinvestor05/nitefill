import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lookupPromo, normalizePromo } from "./promos.ts";

describe("normalizePromo", () => {
  it("strips spaces, dashes, and case", () => {
    assert.equal(normalizePromo(" full-house "), "FULLHOUSE");
    assert.equal(normalizePromo("FullHouse"), "FULLHOUSE");
  });
});

describe("lookupPromo", () => {
  it("accepts FULLHOUSE", () => {
    const grant = lookupPromo("full house");
    assert.ok(grant);
    assert.equal(grant.planId, "pro");
    assert.equal(grant.dailyLimit, 100);
  });

  it("rejects unknown codes", () => {
    assert.equal(lookupPromo("FREEPLEASE"), null);
  });
});
