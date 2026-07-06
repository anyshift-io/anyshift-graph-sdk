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

## Environment

```bash
export ANYSHIFT_API_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

The default endpoint is `https://graph.anyshift.io`. Advanced users can override the endpoint in
client configuration when needed.

## Contract

Public SDK types come from the OpenAPI contract pinned in this repository.
