# Release Guide

This guide covers the public TypeScript SDK release.

## Prerequisites

- The release pull request is merged into `main`.
- The package version in `typescript/package.json` matches the release version.
- `CHANGELOG.md` contains the release notes.
- The matching `typescript-v<version>` tag will identify the immutable merge commit.

## Verify

From `typescript/`:

```bash
npm ci
npm run typecheck
npm test
npm run check:generated
npm run build
npm run test:consumer
npm pack --dry-run
```

## Tag And Publish

Tag the verified merge commit and push the tag:

```bash
git tag typescript-v<version>
git push origin typescript-v<version>
```

Dispatch the **Release TypeScript SDK** workflow with the existing tag. The workflow checks that
the tag matches `package.json`, repeats the complete verification suite, and publishes from that
immutable tag through the protected `npm` environment with provenance. Do not publish the package
from a local checkout.

After the workflow succeeds, create a GitHub release named `@anyshift/graph-sdk v<version>` using
the matching entry from `CHANGELOG.md`.

## Post-release Verification

```bash
npm view @anyshift/graph-sdk version
npm install @anyshift/graph-sdk
```
