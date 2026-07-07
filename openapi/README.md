# OpenAPI Contract

SDK releases pin the Graph API contract here.

The SDKs should not import types or implementation details from the `graph-api` server repository.
The public API contract is the boundary between the server and SDK packages.

Current pinned snapshot:

- `graph-api-v1.json` — OpenAPI contract used by the initial Go SDK.

Expected release flow:

1. Graph API publishes or exposes a versioned OpenAPI document.
2. This repository vendors the exact OpenAPI snapshot used for an SDK release.
3. Language SDKs generate or maintain public types from that snapshot.
4. SDK CI verifies no server-internal imports are used.
