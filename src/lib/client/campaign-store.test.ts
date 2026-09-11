import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  appendLocalLog,
  blankCampaign,
  clearDesk,
  getLocalCampaign,
  handlesToAudience,
  listLocalAudience,
  listLocalCampaigns,
  listLocalLogs,
  mergeCampaignLists,
  mergeLocalAudience,
  parseHandleList,
  sampleRooftop,
  senderDiscoverJob,
  setLocalAudienceStatus,
  upsertLocalCampaign,
} from "./campaign-store.ts";

const mem = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, String(v));
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  },
  configurable: true,
});

describe("campaign desk", () => {
  beforeEach(() => {
    mem.clear();
    clearDesk();
  });

  it("parses handles from messy paste", () => {
    assert.deepEqual(parseHandleList("@FabricLondon, ministryofsound\n boilerroom; @x"), [
      "fabriclondon",
      "ministryofsound",
      "boilerroom",
      "x",
    ]);
  });

  it("keeps a campaign when the server list is empty", () => {
    const created = upsertLocalCampaign(
      blankCampaign({
        id: "cmp_local",
        name: "Rooftop",
        city: "London",
        seedAccounts: "fabriclondon",
        messageTemplate: "hey",
      }),
    );
    assert.equal(created.id, "cmp_local");
    const merged = mergeCampaignLists([]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.name, "Rooftop");
    assert.equal(getLocalCampaign("cmp_local")?.city, "London");
  });

  it("merges discovered people and recounts queued", () => {
    upsertLocalCampaign(blankCampaign({ id: "cmp_1", name: "Night" }));
    mergeLocalAudience("cmp_1", handlesToAudience("cmp_1", "alice, bob, alice"));
    const rows = listLocalAudience("cmp_1");
    assert.equal(rows.length, 2);
    assert.equal(listLocalCampaigns()[0]?.queued, 2);
    setLocalAudienceStatus("cmp_1", "alice", "sent");
    assert.equal(listLocalCampaigns()[0]?.sent, 1);
    assert.equal(listLocalCampaigns()[0]?.queued, 1);
  });

  it("builds a discover job from the sample night", () => {
    const sample = sampleRooftop("cmp_sample");
    const job = senderDiscoverJob(sample);
    assert.equal(job.kind, "discover");
    assert.ok(job.seeds.includes("fabriclondon"));
    assert.ok(job.limit >= 18);
  });

  it("records a sent log once", () => {
    appendLocalLog({
      id: "log_1",
      campaignId: "cmp_1",
      audienceId: "aud_1",
      handle: "alice",
      message: "hey",
      sentAt: new Date().toISOString(),
      replied: false,
      repliedAt: null,
    });
    appendLocalLog({
      id: "log_1",
      campaignId: "cmp_1",
      audienceId: "aud_1",
      handle: "alice",
      message: "hey",
      sentAt: new Date().toISOString(),
      replied: false,
      repliedAt: null,
    });
    assert.equal(listLocalLogs("cmp_1").length, 1);
  });
});
