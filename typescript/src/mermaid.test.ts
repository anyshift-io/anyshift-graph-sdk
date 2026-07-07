import { test } from "node:test";
import assert from "node:assert/strict";
import { toMermaid } from "./mermaid.js";
import type { AskResult, C4Level } from "./types.js";

function topologyResult(level: C4Level): AskResult {
  return {
    question: "q",
    intent: "topology",
    summary: "s",
    nodes: [
      { id: "svc-1", anyshiftID: null, name: "checkout", type: "DATADOG_SERVICE", namespace: null },
      { id: "cont-1", anyshiftID: "a1", name: "worker", type: "K8S_CONTAINER", namespace: "prod", image: "checkout/worker:1.2.3" },
      { id: "db-1", anyshiftID: null, name: "orders-pg", type: "DATADOG_DATASTORE", namespace: null },
    ],
    edges: [
      { from: "svc-1", to: "cont-1", type: "HAS_CONTAINER", direction: "downstream" },
      { from: "svc-1", to: "db-1", type: "USES_DATASTORE", direction: "downstream" },
    ],
    topology: {
      resolved: { term: "checkout", service: "checkout" },
      level,
      nodeCount: 3,
      edgeCount: 2,
      byType: [],
    },
  };
}

test("toMermaid renders a flowchart for container level", () => {
  const out = toMermaid(topologyResult("container"));
  assert.match(out, /^flowchart TB/);
  assert.match(out, /orders-pg/);
  assert.match(out, /checkout\/worker:1\.2\.3/);
  assert.match(out, /-->\|HAS_CONTAINER\|/);
  assert.match(out, /-->\|USES_DATASTORE\|/);
});

test("toMermaid renders a sequenceDiagram for dynamic level", () => {
  const out = toMermaid(topologyResult("dynamic"));
  assert.match(out, /^sequenceDiagram/);
  assert.match(out, /->>/);
  assert.match(out, /: HAS_CONTAINER/);
});

test("toMermaid returns empty string when there is no subgraph", () => {
  const empty: AskResult = { question: "q", intent: "topology", summary: "none", nodes: [], edges: [] };
  assert.equal(toMermaid(empty), "");
});
