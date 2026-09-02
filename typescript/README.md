# Anyshift Graph SDK for TypeScript

The TypeScript SDK is the first public Anyshift Graph SDK. It provides a small, typed client for
querying the Anyshift Graph API from Node.js applications, automation, CI checks, dashboards, and
developer tools.

## Install

```bash
npm install @anyshift/graph-sdk
```

The package is ESM-only and targets Node.js 18+ or runtimes that provide `fetch`.

## Authenticate

```ts
import { GraphAnswer } from "@anyshift/graph-sdk";

const graph = new GraphAnswer({
  token: process.env.ANYSHIFT_TOKEN!,
  project: process.env.ANYSHIFT_PROJECT_ID!,
});
```

The default endpoint is `https://graph.anyshift.io`.

## Query Helpers

Resolve a resource name before opening a drill-down:

```ts
const matches = await graph.resolve({ term: "checkout", limit: 10 });
if (matches.intent === "resolve") {
  console.log(matches.resolve?.candidates);
}
```

```ts
const recent = await graph.events({ since: "1h", limit: 10 });
console.log(recent.summary);
```

For historical incident review, use an exact half-open RFC3339 window. `stats: "none"` skips the
full-window count, and `cursor` continues from `events.page.nextCursor` without rescanning newer
history:

```ts
const historical = await graph.events({
  target: "checkout",
  targetType: "K8S_DEPLOYMENT",
  namespace: "payments",
  cluster: "staging",
  from: "2026-08-30T10:00:00Z",
  until: "2026-08-30T11:00:00Z",
  stats: "none",
  limit: 50,
});
```

Correlate changes only inside a known alert interval and bind them to one workload identity:

```ts
const cause = await graph.alertCause({
  target: "checkout",
  namespace: "payments",
  cluster: "staging",
  alert: "checkout error rate",
  from: "2026-08-30T10:00:00Z",
  to: "2026-08-30T11:00:00Z",
});
console.log(cause.alertCause?.status, cause.alertCause?.suspect, cause.alertCause?.reason);
```

The result is explicit correlation evidence, not proof of causation. Use `targetId` instead of the
qualified name when a stable graph id is available.

```ts
const group = await graph.correlations({ target: "places", since: "2h" });
if (group.intent === "correlations") {
  console.log(group.correlations?.correlationId, group.correlations?.roots);
}
// Prefer graph.correlations(). graph.incident() still works against the legacy
// incidents target and remains available for v1 callers.
```

Read stored provider-neutral operational-response evidence without exposing provider credentials:

```ts
const alerts = await graph.alerts({ provider: "pagerduty", status: "firing", limit: 50 });
const incidents = await graph.incidents({
  service: { name: "api", type: "K8S_SERVICE", namespace: "production", cluster: "main" },
  status: "active",
  since: "7d",
});
const onCall = await graph.onCall({
  providerServiceId: "PABC123",
  at: "now",
});

console.log(alerts.alerts?.items, incidents.incidents?.items, onCall.onCall?.items);
```

PagerDuty people expose `resolution` as `resolved`, `unresolved`, or `ambiguous`. An ambiguous
identity never selects a winner and includes at most ten canonical `candidates`; resolved and
unresolved identities return an empty candidate list.

`alerts()`, `incidents()`, and `onCall()` use the provider-neutral API contract. Canonical service
selectors and `providerServiceId` are mutually exclusive. Operational methods use opaque cursors
and reject invalid RFC3339 windows and limits outside 1-100 before sending a request. In API v1,
`incidents()` targets `response_incidents`; `correlations()` remains the Anyshift event-story API,
and the singular `incident()` remains its deprecated compatibility alias.
The `active` incident status is an umbrella for provider-native open and acknowledged incidents;
use `open` or `acknowledged` when that narrower state matters.

```ts
const changes = await graph.cloudEvents({
  provider: "aws",
  resource: "arn:aws:ecs:eu-west-3:123456789012:service/prod/api",
  stats: "none",
  since: "1d",
  limit: 20,
});
const gcpOperation = await graph.cloudEvents({
  provider: "gcp",
  operation: "operation-123",
  diff: true,
});
if (gcpOperation.intent === "cloudevents") {
  for (const event of gcpOperation.cloudEvents?.items ?? []) {
    console.log(
      event.correlation.providerOperationId,
      event.correlation.id,
      event.evidence.source,
      event.evidence.status,
    );
  }
}
const resources = await graph.cloudResources({
  provider: "aws",
  type: "EC2_INSTANCE",
  lifecycle: "alive",
  maxAge: "24h",
});
const gcpResources = await graph.cloudResources({
  provider: "gcp",
  lifecycle: "alive",
  maxAge: "24h",
});
const provenance = await graph.iac({ resource: "aws_ecs_service.api" });
const drift = await graph.iacDrift({ resource: "aws_ecs_service.api" });
const impact = await graph.impact({ resource: "checkout-db", depth: 2 });
const releases = await graph.deliveryEvents({ stage: "release", since: "7d" });
const releaseProvenance = await graph.provenance({ resource: "checkout" });
const owners = await graph.ownership({ resource: "anyshift-io/checkout" });
const dynatraceCoverage = await graph.graphCoverage({ source: "dynatrace" });
```

For cloud events, `correlation.providerOperationId` groups provider-native activity while
`correlation.id` groups the broader Anyshift event story. `audit`, `snapshot`, and
`reconciliation` identify different evidence sources. Current producers exclude provider-rejected
mutations because they did not change provider state, so their absence does not prove that no
rejected calls occurred. A retained legacy row can still be `failed`; missing outcome evidence
remains `unknown`, never inferred as success. `stats: "none"` skips exact full-window statistics
and returns `total: null` with explicit non-exact metadata; omit `stats` or pass `"exact"` when an
exact total is required. Cloud-resource `provenance: "unknown"` does not mean
unmanaged, and `freshness: "unknown"` does not mean stale.

Join scanner evidence to the exact image digest observed in running containers:

```ts
const runtime = await graph.image({
  digest: "sha256:776129790f01a675bb6e98447c2a28d43a07144d5410691823dbf9a21d256b1e",
  limit: 50,
});

if (runtime.intent === "image" && runtime.image?.mode === "bydigest") {
  for (const match of runtime.image.byDigest?.matches ?? []) {
    console.log(match.clusterName, match.clusterID, match.clusterHashedID);
  }
}
```

Digest lookup accepts a canonical digest, repository digest, or runtime-prefixed image ID. It
matches the canonical digest exactly against live container `image_id` evidence. It cannot be
combined with `target`, `workload`, `kind`, or `namespace`. Each match separates the configured
human cluster name from its provider-native ID and stable Anyshift graph identity.

```ts
const blast = await graph.blast({ resource: "checkout" });
console.log(blast.summary);
```

```ts
const path = await graph.path({
  from: { name: "checkout-api", type: "K8S_DEPLOYMENT" },
  to: { name: "postgresql", type: "TEMPO_DATASTORE" },
  scope: "operational",
});
console.log(path.summary);
```

Typed selectors are deterministic when multiple resource types share the same name. Use
`{ id: candidate.id }` with an id returned by `graph.resolve()` when name, type, namespace, and
cluster still do not identify one node. When a fuzzy selector has multiple equally authoritative
matches, the API rejects the traversal instead of choosing one silently. The SDK preserves the
bounded retry set on `BadQueryError`:

```ts
import { BadQueryError } from "@anyshift/graph-sdk";

try {
  await graph.connections({ resource: "three-tier-app" });
} catch (error) {
  if (error instanceof BadQueryError && error.selectionCode === "ambiguous_resource") {
    for (const candidate of error.candidates) {
      console.error(candidate.id, candidate.name, candidate.type, candidate.namespace);
    }
    // Retry with the selected stable `candidate.id`.
  }
}
```

Existing exact selectors and uniquely ranked fuzzy-name selectors remain compatible.

## Canonical Public Exposure

Trace a qualified workload from the public edge through observed hops and controls:

```ts
import {
  GraphAnswer,
  GraphAnswerError,
  type ExposureResult,
} from "@anyshift/graph-sdk";

try {
  const answer = await graph.exposure({
    resource: {
      name: "checkout-api",
      type: "K8S_DEPLOYMENT",
      namespace: "shop",
      cluster: "prod-eu",
    },
    limit: 20,
  });

  const exposure: ExposureResult = answer.exposure;
  console.log(exposure.verdict, exposure.subject, exposure.paths);

  if (exposure.page.nextCursor) {
    const next = await graph.exposure({
      resource: { id: exposure.subject!.id },
      cursor: exposure.page.nextCursor,
      limit: exposure.page.limit,
    });
    console.log(next.exposure.paths);
  }
} catch (error) {
  if (error instanceof GraphAnswerError && error.code === "unsupported_server") {
    console.error("Upgrade the Graph API server before using canonical exposure results.");
  }
}
```

`resource` accepts a legacy non-empty string, a stable `{ id }`, or a deterministic
`{ name, type, namespace?, cluster? }` selector. Do not combine the selector modes. `cursor` is
the opaque `page.nextCursor` from the preceding result.

The canonical payload distinguishes perspective and verdict, identifies the resolved subject and
ambiguous candidates, and returns evidence-backed paths with hops, controls, explicit gaps, optional
managed `platform` context, and a keyset page. The package exports `ExposureResult`,
`ExposureService`, `ExposureIngressRef`, `ExposurePerspective`, `ExposureVerdict`,
`ExposureResource`, `ExposureEvidence`, `ExposureGap`, `ExposureHop`, `ExposureControl`,
`ExposurePath`, and `ExposurePlatform` for consumer APIs.

A confirmed verdict is grounded in a fresh traffic path. Stale control evidence and partial sibling
branches remain visible as evidence or gaps; they do not erase a separately confirmed fresh path.

Canonical exposure requires Graph API query-language 1.11 or newer. When a legacy server accepts a
string exposure query but returns the older four-field payload, the helper throws
`GraphAnswerError` with code `unsupported_server`. ID, qualified-name, and cursor selectors can be
rejected as `bad_request` by older servers before a payload exists. Public SDK 0.5.7 and earlier do
not runtime-validate successful responses, so their existing string-selector calls and reads of
`direction`, `exposed`, `services`, and `ingresses` continue to work with a 1.11 server.

Tempo-backed APM helpers accept `source: "tempo"`:

```ts
const calls = await graph.calls({ target: "checkout-api", source: "tempo" });
const datastore = await graph.datastore({ target: "postgresql", source: "tempo" });
const topology = await graph.topology({
  service: "checkout-api",
  source: "tempo",
  level: "container",
});
```

ECS configuration evidence is explicit and read-only. Supply a reviewed endpoint alias; when a
dependency name is present the endpoint is required:

```ts
const topology = await graph.topology({
  service: "developer-portal-production",
  source: "configuration",
  endpoint: "api.anyshift.io",
  dependency: "anyshift-backend",
  level: "context",
});
```

Matching edges use `CONFIGURES_ENDPOINT` and include the environment key and task-definition
identity. Environment values are never returned, and configured edges are not marked as causal
impact edges.

The `datastore`, `flow`, `externalDep`, `calls`, `serviceTree`, and `topology` helpers support
`source: "auto" | "datadog" | "tempo" | "dynatrace"`. Topology additionally supports the
explicit `configuration` source. Omitting it preserves the source-agnostic default.

## Topology Diagrams

Use `toMermaid()` to render topology results as Mermaid text.

```ts
import { GraphAnswer, toMermaid } from "@anyshift/graph-sdk";

const topology = await graph.topology({
  service: "checkout",
  level: "container",
});

console.log(toMermaid(topology));
```

`level: "dynamic"` renders a sequence diagram. Other topology levels render flowcharts.

## Raw Queries

For advanced workflows, call the Graph API query endpoint directly with graph SQL:

```ts
const result = await graph.query(
  "SELECT * FROM connections WHERE resource = checkout"
);

console.log(result.summary);
```

See the complete [Graph Query Language reference](../QUERY_LANGUAGE.md) for every target,
filter, accepted value, alias, and valid query form.

## Environment

```bash
export ANYSHIFT_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

Advanced users can override the endpoint in client configuration when needed.

Every SDK request includes the package version and a random invocation ID so
operators can correlate product analytics with Graph API traces. Typed helpers
identify only their fixed query target. Query text, questions, resource names,
namespaces, response bodies, and bearer tokens are never copied into telemetry
headers.

To correlate several calls as one application workflow, pass a UUID as
`invocationId` when constructing `GraphAnswer`.

## Contract

Public SDK response types come from the OpenAPI contract pinned in this repository. `AskResult`
is a discriminated union, so checking `intent` exposes the matching payload without a cast:

```ts
const result = await graph.inventory({ type: "K8S_SERVICE" });

if (result.intent === "inventory") {
  console.log(result.inventory?.total);
}
```

Use `AskResultFor<"inventory">` when a function accepts the response for one known intent.

## Examples

Runnable examples are available in `examples/`:

- `recent-events.ts`
- `blast-radius.ts`
- `path.ts`
- `exposure.ts`
- `raw-query.ts`
- `topology-mermaid.ts`

## Documentation

See the [Anyshift Graph SDK guide](https://docs.anyshift.io/pages/product/integration/sdk) for
product documentation and troubleshooting.

See [CAPABILITIES.md](../CAPABILITIES.md) for the canonical capability matrix: every typed helper,
the graph query target, primary parameters, and what each capability answers.

## Development

```bash
npm install
npm run generate
npm run typecheck
npm test
npm run check:generated
npm run build
npm run test:consumer
```
