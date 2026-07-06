# Anyshift Graph SDK

Public SDKs and examples for the Anyshift Graph API.

The first public SDK release is TypeScript. Python and Go SDKs are planned next, so this
repository is organized as a multi-language SDK home from day one.

## Packages

| Language | Package | Status |
| --- | --- | --- |
| TypeScript | `@anyshift/graph-sdk` | First public release |
| Python | `anyshift-graph` | Planned |
| Go | `github.com/anyshift-io/anyshift-graph-sdk/go` | Planned |

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

Product documentation, onboarding guides, and use-case recipes will be published on the
Anyshift documentation site.

## Contract Boundary

SDKs depend on the public Graph API contract. TypeScript types should be generated from, or
pinned to, the OpenAPI contract in `openapi/`.
