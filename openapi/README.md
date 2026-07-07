# OpenAPI Contract

SDK releases pin the Graph API contract here.

Current snapshot: `graph-api.v1.json`.

The public API contract is the compatibility boundary between the Anyshift Graph API and the SDK
packages.

Expected release flow:

1. Anyshift publishes or exposes a versioned OpenAPI document for the Graph API.
2. This repository vendors the exact OpenAPI snapshot used for an SDK release.
3. Language SDKs generate or maintain public types from that snapshot.
4. SDK CI verifies the generated types and package APIs stay aligned with that snapshot.
