# TypeScript SDK

The TypeScript SDK is the first public Anyshift Graph SDK.

Target package name:

```bash
npm install @anyshift/graph-sdk
```

Initial scope:

- Read-only Graph API client.
- Production endpoint default: `https://graph.anyshift.io`.
- Authentication with an Anyshift API token and project ID.
- Typed methods for stable Graph API intents.
- Escape hatches for raw `query` and natural-language `ask`.

Package-level examples will live under `typescript/examples/`.

## Usage

```ts
import { GraphAnswer } from "@anyshift/graph-sdk";

const graph = new GraphAnswer({
  token: process.env.ANYSHIFT_API_TOKEN,
  project: process.env.ANYSHIFT_PROJECT_ID,
});

const recent = await graph.events({ since: "1h", limit: 10 });
console.log(recent.summary);
```

## Environment

```bash
export ANYSHIFT_API_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

The default endpoint is `https://graph.anyshift.io`. Advanced users can override the endpoint in
client configuration when needed.

## Contract

Public SDK types come from the OpenAPI contract pinned in this repository.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```
