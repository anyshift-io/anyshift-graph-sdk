# Changelog

## 0.4.1 - 2026-07-22

### Changed

- Pinned the Graph API v0.2.14 contract and query-language 1.2 catalog.
- Exposed nullable stable `resourceId` values on inventory samples so consumers can keep
  resource identities stable across synchronization cycles.
- Added privacy-safe request correlation headers for SDK version, invocation, workflow, and
  workflow step without transmitting query text, questions, resource names, namespaces, or tokens.

## 0.4.0 - 2026-07-21

### Added

- Added deterministic path selectors by resource name and type, namespace, cluster, or stable id.
- Added operational path scope for Grafana Tempo service, datastore, call, and messaging edges.
- Added explicit Tempo source selection to datastore, flow, external-dependency, call graph,
  service-tree, and topology helpers.

### Compatibility

- Existing string-based `graph.path({ from, to })` calls retain fuzzy-name resolution and the
  infrastructure-only path scope.

## 0.3.0 - 2026-07-21

### Added

- Added `graph.resolve({ term, limit })` for deterministic current-resource lookup.
- Added typed `ResolveResult` and `ResolveCandidate` exports.
- Pinned the 42-intent Graph API contract with the new `resolve` response.

## 0.2.0 - 2026-07-15

### Changed

- Pinned the executable Graph API contract published with graph-api v0.2.0.
- Generated TypeScript response schemas from the pinned OpenAPI document.
- Replaced the permissive response envelope with a 41-variant `AskResult` discriminated union.
- Added `AskResultFor<Intent>` for selecting an exact intent response type.
- Added reproducible contract synchronization and compile-time contract tests.
- Refined the capability matrix for incidents, common causes, and RBAC access.

This release preserves runtime request compatibility. The stronger response types can reveal invalid
compile-time assumptions that `0.1.0` accepted.

## 0.1.0 - 2026-07-07

First public release of the Anyshift Graph SDK.

### Added

- TypeScript package `@anyshift/graph-sdk`.
- `GraphAnswer` client for the Anyshift Graph API.
- Production default endpoint: `https://graph.anyshift.io`.
- Project-scoped `ask` and `query` requests.
- Typed helper methods for graph intents including events, blast radius, paths, topology, storage, scaling, PDB coverage, network policies, image hygiene, alert analysis, and service dependencies.
- `toMermaid()` helper for rendering topology results as Mermaid diagrams.
- Public OpenAPI snapshot at `openapi/graph-api.v1.json`.
- Runnable TypeScript examples under `typescript/examples/`.
- TypeScript CI for typecheck, tests, and build.
