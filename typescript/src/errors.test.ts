import { test } from "node:test";
import assert from "node:assert/strict";
import { GraphAnswerError, AuthError, BadQueryError } from "./errors.js";

test("GraphAnswerError carries code/message/status and timeout diagnostics", () => {
  const e = new GraphAnswerError("timeout", "boom", 504, {
    timeoutSource: "statement", requestId: "req-2133",
  });
  assert.equal(e.code, "timeout");
  assert.equal(e.message, "boom");
  assert.equal(e.status, 504);
  assert.equal(e.timeoutSource, "statement");
  assert.equal(e.requestId, "req-2133");
  assert.ok(e instanceof Error);
});

test("AuthError and BadQueryError are GraphAnswerError subclasses with codes", () => {
  const a = new AuthError("nope");
  const b = new BadQueryError("bad sql");
  assert.ok(a instanceof GraphAnswerError);
  assert.equal(a.code, "unauthorized");
  assert.ok(b instanceof GraphAnswerError);
  assert.equal(b.code, "bad_request");
  assert.equal(b.message, "bad sql");
  assert.equal(b.selectionCode, undefined);
  assert.deepEqual(b.candidates, []);
});
