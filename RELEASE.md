# Release Guide

This guide covers the public TypeScript SDK release.

## Prerequisites

- The release pull request is merged into `main`.
- The package version in `typescript/package.json` matches the release version.
- `CHANGELOG.md` contains the release notes.
- The publisher is logged into npm with access to the `@anyshift` scope.

Check npm access:

```bash
npm whoami
npm access ls-packages @anyshift
```

## Verify

From `typescript/`:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

## Publish

From `typescript/`:

```bash
npm publish --access public
```

## Tag and GitHub Release

After npm publish succeeds:

```bash
git tag typescript-v0.1.0
git push origin typescript-v0.1.0
```

Create a GitHub release named `@anyshift/graph-sdk v0.1.0` using the `0.1.0` entry from
`CHANGELOG.md`.

## Post-release Verification

```bash
npm view @anyshift/graph-sdk version
npm install @anyshift/graph-sdk
```
