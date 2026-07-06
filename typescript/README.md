# TypeScript SDK

The TypeScript SDK is the first public Anyshift Graph SDK.

Target package name:

```bash
npm install @anyshift/graph-sdk
```

Initial scope:

- Read-only Graph API client.
- Production endpoint default: `https://graph.anyshift.io`.
- Managed auth with `ANYSHIFT_TOKEN` and `ANYSHIFT_PROJECT_ID`.
- Typed methods for stable Graph API intents.
- Escape hatches for raw `query` and natural-language `ask`.

Package-level examples will live under `typescript/examples/`.

## Environment

```bash
export ANYSHIFT_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

Local development can override the endpoint explicitly:

```bash
export ENGINE_URL="http://localhost:8099"
```

## Contract Rule

Do not import TypeScript types from `graph-api/engine/src`. Public SDK types must come from the
OpenAPI contract pinned in this repository.
