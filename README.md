# Anyshift Graph SDK

Public SDKs and examples for the Anyshift Graph API.

The first public SDK release is TypeScript. Python and Go SDKs are planned next, so this
repository is organized as a multi-language SDK home from day one.

## Packages

| Language | Package | Status |
| --- | --- | --- |
| TypeScript | `@anyshift/graph-sdk` | First public release |
| Python | `anyshift-graph` | Planned |
| Go | `github.com/anyshift-io/anyshift-graph-sdk/go` | Initial SDK |

## Repository Layout

```text
openapi/      Pinned Graph API contract snapshots used by SDK releases
typescript/   TypeScript SDK package and examples
python/       Future Python SDK
go/           Future Go SDK
```

## Documentation

This repository owns package-level documentation: installation, examples, local SDK
development, and release notes.

Customer-facing product documentation lives in the `website-docs` repository. Use those docs for
Graph API concepts, authentication setup, project onboarding, and use-case recipes.

## Contract Boundary

SDKs must depend on the public Graph API contract, not on `graph-api` server internals. TypeScript
types should be generated from, or pinned to, the OpenAPI contract in `openapi/`.
