import { test } from "node:test";
import assert from "node:assert/strict";
import { GraphAnswer } from "./client.js";
import { AuthError, BadQueryError, GraphAnswerError } from "./errors.js";

// Minimal fake response matching FetchLike's return contract.
const resp = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

test("query posts to /v1/query with the sql body and returns the result", async () => {
  let captured: any;
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (url, init) => {
      captured = { url, init };
      return resp(200, { intent: "events", summary: "ok", events: { total: 1 } });
    },
  });
  const r = await gx.query("SELECT count(*) FROM events WHERE type = oom");
  assert.equal(r.intent, "events");
  assert.equal(captured.url, "http://x/v1/query");
  assert.equal(captured.init.method, "POST");
  assert.equal(JSON.parse(captured.init.body).sql, "SELECT count(*) FROM events WHERE type = oom");
});

test("ask posts to /ask with the question body", async () => {
  let body: any;
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (_url, init) => {
      body = JSON.parse(init.body);
      return resp(200, { intent: "events", summary: "ok" });
    },
  });
  await gx.ask("what's broken?");
  assert.equal(body.question, "what's broken?");
});

test("project option routes through project scoped paths", async () => {
  let captured: any;
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    token: "secret123",
    project: "proj-a",
    fetch: async (url, init) => {
      captured = { url, init };
      return resp(200, { intent: "events", summary: "ok" });
    },
  });
  await gx.query("SELECT count(*) FROM events");
  assert.equal(captured.url, "http://x/v1/projects/proj-a/query");
  assert.equal(captured.init.headers["authorization"], "Bearer secret123");
  assert.equal(captured.init.headers["x-project"], undefined);
});

test("project option routes ask through project scoped paths", async () => {
  let captured: any;
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    token: "secret123",
    project: "proj-a",
    fetch: async (url, init) => {
      captured = { url, init };
      return resp(200, { intent: "events", summary: "ok" });
    },
  });
  await gx.ask("what changed?");
  assert.equal(captured.url, "http://x/v1/projects/proj-a/ask");
});

test("401 -> AuthError, 400 -> BadQueryError, 500 -> GraphAnswerError", async () => {
  const make = (status: number, body: unknown) =>
    new GraphAnswer({ baseUrl: "http://x", fetch: async () => resp(status, body) });
  await assert.rejects(
    () => make(401, { error: { code: "unauthorized", message: "nope" } }).query("x"),
    (e: any) => e instanceof AuthError && e.message === "nope"
  );
  await assert.rejects(
    () => make(400, { error: { code: "bad_request", message: "Unknown table" } }).query("x"),
    (e: any) => e instanceof BadQueryError && /Unknown table/.test(e.message)
  );
  await assert.rejects(
    () => make(500, { error: { code: "internal", message: "boom" } }).query("x"),
    (e: any) => e instanceof GraphAnswerError && e.code === "internal" && e.status === 500
  );
});
