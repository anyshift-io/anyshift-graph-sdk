import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GraphAnswer } from "./client.js";
import { AuthError, BadQueryError, GraphAnswerError } from "./errors.js";
import { GRAPH_SDK_VERSION } from "./version.js";

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
  assert.equal(captured.init.headers["x-anyshift-client"], "graph-sdk-typescript");
  assert.equal(captured.init.headers["x-anyshift-client-version"], GRAPH_SDK_VERSION);
  assert.equal(captured.init.headers["x-anyshift-graph-workflow"], "query");
  assert.equal(captured.init.headers["x-anyshift-graph-step"], undefined);
  assert.match(captured.init.headers["x-anyshift-invocation-id"], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.doesNotMatch(JSON.stringify(captured.init.headers), /oom/);
});

test("ask posts to /ask with the question body", async () => {
  let body: any;
  let headers: Record<string, string> = {};
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (_url, init) => {
      body = JSON.parse(init.body);
      headers = init.headers;
      return resp(200, { intent: "events", summary: "ok" });
    },
  });
  await gx.ask("what's broken?");
  assert.equal(body.question, "what's broken?");
  assert.equal(headers["x-anyshift-graph-workflow"], "ask");
  assert.doesNotMatch(JSON.stringify(headers), /what's broken/);
});

test("typed helpers identify only their fixed target and each request gets an invocation", async () => {
  const headers: Record<string, string>[] = [];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (_url, init) => {
      headers.push(init.headers);
      return resp(200, { intent: "events", summary: "ok" });
    },
  });
  await gx.events({ target: "customer-secret-workload", since: "2h" });
  await gx.events({ target: "another-secret-workload", since: "2h" });

  assert.equal(headers[0]["x-anyshift-graph-workflow"], "typed-query");
  assert.equal(headers[0]["x-anyshift-graph-step"], "events");
  assert.notEqual(headers[0]["x-anyshift-invocation-id"], headers[1]["x-anyshift-invocation-id"]);
  assert.doesNotMatch(JSON.stringify(headers), /customer-secret|another-secret/);
});

test("caller-supplied invocation id correlates several requests", async () => {
  const invocationId = "b14e8f48-1547-4a50-a6f6-1089cfc55fa6";
  const captured: string[] = [];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    invocationId,
    fetch: async (_url, init) => {
      captured.push(init.headers["x-anyshift-invocation-id"]);
      return resp(200, { intent: "events", summary: "ok" });
    },
  });

  await gx.events({ since: "2h" });
  await gx.ask("what changed?");
  assert.deepEqual(captured, [invocationId, invocationId]);
});

test("caller-supplied invocation id must be a UUID", () => {
  assert.throws(
    () => new GraphAnswer({ invocationId: "customer-secret-workload" }),
    /invocationId must be a UUID/,
  );
});

test("telemetry version matches the published package version", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(GRAPH_SDK_VERSION, packageJson.version);
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
