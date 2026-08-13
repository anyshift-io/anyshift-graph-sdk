# Changelog

## 0.5.10 - 2026-08-13

### Added

- Added exported `ResourceSelectionCandidate` and candidate-aware `BadQueryError` fields for
  ambiguous topology resource terms.
- Added bounded ambiguity examples that retry with stable resource IDs.

### Compatibility

- Exact selectors and uniquely ranked fuzzy selectors retain their existing behavior. Ambiguous
  fuzzy topology terms now fail closed on a compatible Graph API server instead of traversing from
  an arbitrary first match.

## 0.5.9 - 2026-08-13

### Added

- Added exact provider-operation filtering to `graph.cloudEvents({ operation })` for GCP and
  other provider-native event streams.
- Added exported `CloudEventsResult` and `CloudEventItem` types, including the distinct
  `correlation.providerOperationId` and Anyshift `correlation.id` fields.
- Added GCP event and inventory examples with explicit evidence-source, status, freshness, and
  provenance boundaries.

### Changed

- Pinned the Graph API query-language 1.12 contract and regenerated TypeScript response types and
  the deterministic query reference.

### Compatibility

- Existing cloud-event calls emit the same SQL. The optional `operation` filter requires a Graph
  API server with query-language 1.12; older servers reject that selector instead of silently
  broadening the result.

## 0.5.8 - 2026-08-11

### Added

- Added stable-id and type-qualified selectors plus keyset cursor pagination to
  `graph.exposure()`.
- Added canonical public-exposure types for perspectives, verdicts, resources, evidence, hops,
  controls, gaps, paths, and pages.
- Added typed APM source, observation time, and HTTP operation evidence to graph edges and detailed
  incoming/outgoing call results from the synchronized canonical contract.
- Added generated OpenAPI drift detection and a clean pack/install/typecheck/import/use consumer
  test to CI and the release workflow.

### Changed

- Pinned the Graph API query-language 1.11 contract with a required, non-null canonical exposure
  payload.
- `graph.exposure()` now returns `AskResultFor<"exposure">` and rejects successful legacy payloads
  without canonical evidence using the stable `unsupported_server` error code.

### Compatibility

- Existing string selectors still emit the same query. Public SDK 0.5.7 and earlier continue to
  consume the additive 1.11 response at runtime. Canonical exposure in SDK 0.5.8 requires a 1.11
  server; new selector columns can be rejected by older query parsers before response validation.

## 0.5.7 - 2026-08-05

### Changed

- Exact runtime digest matches now expose the configured `clusterName`, provider-native
  `clusterID`, and stable `clusterHashedID` separately. The existing `scope` field remains the
  provider-native cluster ID for backward compatibility.
- Pinned the Graph API v0.2.38 contract.

## 0.5.6 - 2026-08-05

### Added

- Added `graph.image({ digest })` for exact live runtime digest lookup, including typed container,
  pod, workload, namespace, cluster, raw runtime image ID, and stable graph identities.

### Changed

- Pinned the Graph API contract and query-language 1.10 catalog.

## 0.5.5 - 2026-07-31

### Added

- Added explicit ECS configuration topology parameters and typed redacted edge evidence.

### Changed

- Pinned the Graph API v0.2.32 contract and query-language 1.9 catalog.

## 0.5.4 - 2026-07-31

### Added

- Added Dynatrace source selection across APM dependency and topology helpers.
- Added typed `graphCoverage` evidence counts for graph nodes, relationships, explicit bridges,
  and events by producer source.

### Changed

- Pinned the Graph API v0.2.30 contract and query-language 1.8 catalog.

## 0.5.3 - 2026-07-31

### Added

- Added typed `deliveryEvents`, `provenance`, and `ownership` helpers for stored delivery,
  release-to-commit-to-actor, and `OWNS_CODE` evidence.

### Changed

- Pinned the Graph API v0.2.29 contract and query-language 1.7 catalog.

## 0.5.2 - 2026-07-31

### Added

- Added typed `impact` traversal over the Graph API's reviewed, directional operational-edge
  allowlist with bounded depth.

### Changed

- Pinned the Graph API v0.2.28 contract and query-language 1.6 catalog.

## 0.5.1 - 2026-07-31

### Added

- Added typed `cloudResources` inventory with lifecycle, freshness, native identity, IaC
  provenance, and keyset pagination.
- Added reviewed semantic classes and conservative impact eligibility to graph edges.

### Changed

- Pinned the Graph API v0.2.27 contract and query-language 1.5 catalog.

## 0.5.0 - 2026-07-31

### Added

- Added typed `cloudEvents`, `iac`, and `iacDrift` helpers.
- Added structured AWS, Azure, and GCP change-event response types, including evidence
  availability, actor attribution, sanitized diffs, provenance, and keyset pagination.
- Added Terraform code-to-state-to-cloud provenance and evidence-aware drift response types.

### Changed

- Pinned the Graph API v0.2.26 contract and query-language 1.4 catalog.

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
