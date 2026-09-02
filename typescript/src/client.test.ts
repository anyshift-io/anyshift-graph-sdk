import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GraphAnswer } from "./client.js";
import { AuthError, BadQueryError, GraphAnswerError } from "./errors.js";
import { GRAPH_SDK_VERSION } from "./version.js";

// Minimal fake response matching FetchLike's return contract.
const resp = (status: number, body: unknown, requestId?: string) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name: string) => name.toLowerCase() === "x-request-id" ? requestId ?? null : null },
  text: async () => JSON.stringify(body),
});

const canonicalExposureResponse = {
  question: "",
  intent: "exposure",
  summary: "Public exposure confirmed.",
  exposure: {
    direction: "workload",
    exposed: true,
    services: [],
    ingresses: [{ ingress: "public-ingress", namespace: "shop", via: "checkout" }],
    perspective: "workload_to_edge",
    verdict: "confirmed",
    subject: {
      id: "resource-hash",
      name: "checkout-api",
      type: "K8S_DEPLOYMENT",
      provider: "kubernetes",
      namespace: "shop",
      scope: "prod-eu",
    },
    candidates: [],
    paths: [],
    page: { limit: 20, hasMore: false, nextCursor: null },
  },
};

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

test("resolve and blast compose stable and qualified resource selectors", async () => {
  const statements: string[] = [];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (_url, init) => {
      statements.push(JSON.parse(init.body).sql);
      return resp(200, { intent: "resolve", summary: "ok" });
    },
  });

  await gx.resolve({ term: { name: "checkout", type: "K8S_DEPLOYMENT", namespace: "apps", cluster: "staging" }, limit: 5 });
  await gx.resolve({ term: { id: "checkout-staging-id" }, limit: 1 });
  await gx.blast({ resource: { name: "checkout", cluster: "staging" }, limit: 20 });
  await gx.blast({ resource: { id: "checkout-staging-id" }, limit: 20 });

  assert.deepEqual(statements, [
    "SELECT * FROM resolve WHERE term = 'checkout' AND resource_type = 'K8S_DEPLOYMENT' AND resource_namespace = 'apps' AND resource_cluster = 'staging' LIMIT 5",
    "SELECT * FROM resolve WHERE resource_id = 'checkout-staging-id' LIMIT 1",
    "SELECT * FROM blast_radius WHERE resource = 'checkout' AND resource_cluster = 'staging' LIMIT 20",
    "SELECT * FROM blast_radius WHERE resource_id = 'checkout-staging-id' LIMIT 20",
  ]);
});

test("resolve and blast reject empty or conflicting resource selectors before fetch", () => {
  const calls: string[] = [];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (_url, init) => {
      calls.push(JSON.parse(init.body).sql);
      return resp(200, { intent: "resolve", summary: "ok" });
    },
  });

  const invalidResolve = [
    "",
    { id: "" },
    { name: "" },
    { name: "checkout", cluster: "" },
    { id: "resource-id", cluster: "staging" },
    { id: "resource-id", name: "checkout" },
    {},
    null,
  ];
  for (const term of invalidResolve) {
    assert.throws(() => gx.resolve({ term } as any), TypeError);
  }
  assert.throws(() => gx.blast({ resource: { name: "checkout", namespace: "" } } as any), TypeError);
  assert.equal(calls.length, 0);
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
  assert.equal(packageJson.version, "0.5.16");
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

test("timeouts expose server layer and request id, with a gateway fallback", async () => {
  for (const [serverSource, wantSource] of [["statement", "statement"], ["request", "request"], [undefined, "gateway"]] as const) {
    const gx = new GraphAnswer({
      baseUrl: "http://x",
      fetch: async () => resp(504, {
        error: { code: "timeout", message: "timed out", ...(serverSource ? { timeoutSource: serverSource } : {}) },
      }, "req-2133"),
    });
    await assert.rejects(
      () => gx.query("SELECT * FROM hotspots"),
      (error: unknown) => error instanceof GraphAnswerError &&
        error.code === "timeout" && error.timeoutSource === wantSource && error.requestId === "req-2133",
    );
  }

  const gateway = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(504, "gateway timeout", "req-gateway"),
  });
  await assert.rejects(
    () => gateway.query("SELECT * FROM hotspots"),
    (error: unknown) => error instanceof GraphAnswerError &&
      error.code === "timeout" && error.timeoutSource === "gateway" && error.requestId === "req-gateway",
  );

  const gatewayEnvelope = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(504, {
      error: { code: "gateway_timeout", message: "upstream timed out" },
    }, "req-gateway-envelope"),
  });
  await assert.rejects(
    () => gatewayEnvelope.query("SELECT * FROM hotspots"),
    (error: unknown) => error instanceof GraphAnswerError &&
      error.code === "timeout" && error.timeoutSource === "gateway" && error.requestId === "req-gateway-envelope",
  );
});

test("400 ambiguity envelopes preserve bounded resource candidates", async () => {
  const candidates = [{
    id: "service-api-hash",
    anyshiftID: "//run.googleapis.com/projects/example/locations/us-central1/services/three-tier-app-api",
    name: "three-tier-app-api",
    type: "RUN_SERVICES",
    namespace: "us-central1",
    cluster: "gcp/example",
  }];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(400, {
      error: {
        code: "bad_request",
        message: "Resource is ambiguous.",
        selectionCode: "ambiguous_resource",
        candidates,
      },
    }),
  });
  await assert.rejects(
    () => gx.query("SELECT * FROM connections WHERE resource = three-tier-app"),
    (error: unknown) => error instanceof BadQueryError &&
      error.selectionCode === "ambiguous_resource" &&
      JSON.stringify(error.candidates) === JSON.stringify(candidates),
  );
});

test("400 ambiguity envelopes discard malformed resource candidates", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(400, {
      error: {
        code: "bad_request",
        message: "Resource is ambiguous.",
        selectionCode: "ambiguous_resource",
        candidates: [{ id: "incomplete", name: "missing nullable fields" }],
      },
    }),
  });
  await assert.rejects(
    () => gx.query("SELECT * FROM connections WHERE resource = three-tier-app"),
    (error: unknown) => error instanceof BadQueryError &&
      error.selectionCode === "ambiguous_resource" &&
      error.candidates.length === 0,
  );
});

test("exposure accepts the canonical query-language 1.11 response", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(200, canonicalExposureResponse),
  });

  const result = await gx.exposure({ resource: { id: "resource-hash" } });
  assert.equal(result.intent, "exposure");
  assert.equal(result.exposure.verdict, "confirmed");
  assert.equal(result.exposure.subject?.id, "resource-hash");
});

test("additive 1.11 exposure responses preserve the public 0.5.7 successful transport seam", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(200, canonicalExposureResponse),
  });

  // Public 0.5.7 JSON-parsed successful responses without runtime schema validation. `query()`
  // keeps that transport behavior, while the 0.5.8 exposure helper adds its feature boundary.
  const result = await gx.query("SELECT * FROM exposure WHERE resource = checkout-api");
  assert.equal(result.intent, "exposure");
  assert.equal(result.exposure.direction, "workload");
  assert.equal(result.exposure.exposed, true);
  assert.deepEqual(result.exposure.services, []);
  assert.equal(result.exposure.ingresses[0]?.ingress, "public-ingress");
});

test("exposure reports a stable unsupported-server error for a legacy 2xx payload", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(200, {
      question: "",
      intent: "exposure",
      summary: "Legacy exposure response.",
      exposure: {
        direction: "workload",
        exposed: true,
        services: [],
        ingresses: [],
      },
    }),
  });

  await assert.rejects(
    () => gx.exposure({ resource: "checkout-api" }),
    (error: unknown) => error instanceof GraphAnswerError
      && error.code === "unsupported_server"
      && error.status === undefined
      && error.message === "Canonical exposure results require Graph API query-language 1.11 or newer; upgrade the server.",
  );
});

test("exposure reports the same unsupported-server boundary for a null canonical payload", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(200, {
      question: "",
      intent: "exposure",
      summary: "No canonical payload.",
      exposure: null,
    }),
  });

  await assert.rejects(
    () => gx.exposure({ resource: "checkout-api" }),
    (error: unknown) => error instanceof GraphAnswerError
      && error.code === "unsupported_server"
      && /query-language 1\.11/.test(error.message),
  );
});

test("new exposure selectors preserve an old server query-parser rejection", async () => {
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async () => resp(400, {
      error: { code: "bad_request", message: "Unknown column: resource_id" },
    }),
  });

  await assert.rejects(
    () => gx.exposure({ resource: { id: "resource-hash" } }),
    (error: unknown) => error instanceof BadQueryError
      && error.code === "bad_request"
      && error.message === "Unknown column: resource_id",
  );
});
