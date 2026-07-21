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

```ts
const blast = await graph.blast({ resource: "checkout" });
console.log(blast.summary);
```

```ts
const path = await graph.path({ from: "checkout", to: "checkout-postgres" });
console.log(path.summary);
```

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

## Environment

```bash
export ANYSHIFT_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

Advanced users can override the endpoint in client configuration when needed.

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
npm run build
```
