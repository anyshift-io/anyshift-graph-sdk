import { test } from "node:test";
import assert from "node:assert/strict";
import { GraphAnswerError, AuthError, BadQueryError } from "./errors.js";

test("GraphAnswerError carries code/message/status", () => {
  const e = new GraphAnswerError("internal", "boom", 500);
  assert.equal(e.code, "internal");
  assert.equal(e.message, "boom");
  assert.equal(e.status, 500);
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
});
