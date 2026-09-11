import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mintSignedToken, userIdFromSignedToken } from "./ext-token.ts";

describe("signed pairing tokens", () => {
  it("round-trips a user id", async () => {
    const token = await mintSignedToken("user_abc-123");
    assert.match(token, /^nf1\./);
    assert.equal(await userIdFromSignedToken(token), "user_abc-123");
  });

  it("rejects a tampered token", async () => {
    const token = await mintSignedToken("user_abc-123");
    const bad = token.slice(0, -2) + "00";
    assert.equal(await userIdFromSignedToken(bad), null);
  });
});
